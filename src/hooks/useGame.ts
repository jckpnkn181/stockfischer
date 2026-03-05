import { useState, useCallback, useRef } from 'react'
import type { Screen, BotConfig, GameState, GameResult, GameOutcome, GameReason, MoveRecord } from '../types'
import { generateChess960Fen, randomPositionId } from '../chess960/positions'
import { createGame, makeMove, getGameState } from '../chess960/gameLogic'
import { useStockfish } from './useStockfish'
import type { Chess } from 'chessops/chess'
import { makeSquare } from 'chessops'

/**
 * Extract a position key from a FEN string by stripping the halfmove clock
 * and fullmove counter. The resulting key uniquely identifies the board
 * position, active color, castling rights, and en-passant square, which is
 * the canonical definition used for threefold-repetition detection.
 */
function getPositionKey(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ')
}

export function useGame() {
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null)
  const [positionId, setPositionId] = useState<number>(randomPositionId())
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)

  const posRef = useRef<Chess | null>(null)
  const historyRef = useRef<MoveRecord[]>([])
  const initialFenRef = useRef<string>('')
  const uciMovesRef = useRef<string[]>([])
  const positionCountsRef = useRef<Map<string, number>>(new Map())

  const { status: engineStatus, isThinking, configure, getMove, stopThinking } = useStockfish()

  const updateGameState = useCallback(() => {
    if (!posRef.current) return
    const state = getGameState(
      posRef.current,
      historyRef.current,
      positionId,
      initialFenRef.current
    )
    setGameState(state)
    return state
  }, [positionId])

  const checkGameOver = useCallback(
    (state: GameState) => {
      if (!selectedBot) return false

      let outcome: GameOutcome
      let reason: GameReason

      if (state.isCheckmate) {
        outcome = state.turn === 'white' ? 'loss' : 'win'
        reason = 'checkmate'
      } else if (state.isStalemate) {
        outcome = 'draw'
        reason = 'stalemate'
      } else if (state.isDraw) {
        outcome = 'draw'
        reason = 'insufficient_material'
      } else {
        // Check threefold repetition
        const posKey = getPositionKey(state.fen)
        const count = positionCountsRef.current.get(posKey) ?? 0
        if (count >= 3) {
          outcome = 'draw'
          reason = 'threefold_repetition'
        } else if (posRef.current && posRef.current.halfmoves >= 100) {
          // 50-move rule: 100 half-moves without a pawn move or capture
          outcome = 'draw'
          reason = 'fifty_moves'
        } else {
          return false
        }
      }

      setGameResult({
        outcome,
        reason,
        positionId,
        bot: selectedBot,
        moveCount: Math.ceil(historyRef.current.length / 2),
      })
      setScreen('result')
      return true
    },
    [selectedBot, positionId]
  )

  const engineMove = useCallback(async () => {
    if (!posRef.current || !selectedBot) return

    try {
      const bestMove = await getMove(
        initialFenRef.current,
        uciMovesRef.current,
        selectedBot.depth,
        selectedBot.moveTime
      )

      if (!posRef.current) return

      // Handle bestmove (none)
      if (!bestMove || bestMove === '(none)') {
        console.error('Engine returned no move')
        return
      }

      // Parse UCI move (e.g., "e2e4" or "e7e8q")
      const from = bestMove.slice(0, 2)
      const to = bestMove.slice(2, 4)
      const promoChar = bestMove[4]
      const promoMap: Record<string, string> = {
        q: 'queen',
        r: 'rook',
        b: 'bishop',
        n: 'knight',
      }
      const promotion = promoChar ? promoMap[promoChar] : undefined

      // For Chess960 castling: engine may send king-to-rook UCI moves
      // Try direct move first, then handle castling
      const result = makeMove(posRef.current, from, to, promotion as 'queen' | 'rook' | 'bishop' | 'knight' | undefined)

      if (result) {
        posRef.current = result.pos
        historyRef.current = [...historyRef.current, { san: result.san, uci: result.uci, fen: result.fen }]
        uciMovesRef.current = [...uciMovesRef.current, result.uci]
        const posKey = getPositionKey(result.fen)
        positionCountsRef.current.set(posKey, (positionCountsRef.current.get(posKey) ?? 0) + 1)
        const state = updateGameState()
        if (state) checkGameOver(state)
      } else {
        console.error(`Engine move failed: ${bestMove}`)
      }
    } catch (err) {
      console.error('Engine move failed:', err)
    }
  }, [selectedBot, getMove, updateGameState, checkGameOver])

  const startGame = useCallback(
    (bot: BotConfig, posId?: number) => {
      const id = posId ?? randomPositionId()
      setPositionId(id)
      setSelectedBot(bot)

      const fen = generateChess960Fen(id)
      initialFenRef.current = fen
      historyRef.current = []
      uciMovesRef.current = []
      positionCountsRef.current = new Map([[getPositionKey(fen), 1]])

      const pos = createGame(fen)
      posRef.current = pos

      configure(bot.rating, bot.skillLevel)

      const state = getGameState(pos, [], id, fen)
      setGameState(state)
      setGameResult(null)
      setScreen('game')
    },
    [configure]
  )

  const playerMove = useCallback(
    (from: string, to: string, promotion?: string): boolean => {
      if (!posRef.current || gameState?.turn !== 'white') return false

      const result = makeMove(
        posRef.current,
        from,
        to,
        promotion as 'queen' | 'rook' | 'bishop' | 'knight' | undefined
      )
      if (!result) return false

      posRef.current = result.pos
      historyRef.current = [...historyRef.current, { san: result.san, uci: result.uci, fen: result.fen }]
      uciMovesRef.current = [...uciMovesRef.current, result.uci]
      const posKey = getPositionKey(result.fen)
      positionCountsRef.current.set(posKey, (positionCountsRef.current.get(posKey) ?? 0) + 1)

      const state = updateGameState()
      if (state && !checkGameOver(state)) {
        // Trigger engine move
        setTimeout(() => engineMove(), 100)
      }

      return true
    },
    [gameState?.turn, updateGameState, checkGameOver, engineMove]
  )

  const resign = useCallback(() => {
    if (!selectedBot) return

    stopThinking()
    setGameResult({
      outcome: 'loss',
      reason: 'resignation',
      positionId,
      bot: selectedBot,
      moveCount: Math.ceil(historyRef.current.length / 2),
    })
    setScreen('result')
  }, [selectedBot, positionId, stopThinking])

  const playAgain = useCallback(() => {
    if (selectedBot) {
      startGame(selectedBot)
    }
  }, [selectedBot, startGame])

  const goHome = useCallback(() => {
    stopThinking()
    posRef.current = null
    historyRef.current = []
    uciMovesRef.current = []
    positionCountsRef.current = new Map()
    setGameState(null)
    setGameResult(null)
    setScreen('home')
  }, [stopThinking])

  const findKingSquare = useCallback((): string | undefined => {
    if (!posRef.current || !gameState?.isCheck) return undefined
    const board = posRef.current.board
    const kingSet = board.king.intersect(board[posRef.current.turn])
    for (const sq of kingSet) {
      return makeSquare(sq)
    }
    return undefined
  }, [gameState?.isCheck])

  return {
    screen,
    selectedBot,
    setSelectedBot,
    positionId,
    setPositionId,
    gameState,
    gameResult,
    engineStatus,
    isThinking,
    startGame,
    playerMove,
    resign,
    playAgain,
    goHome,
    findKingSquare,
  }
}
