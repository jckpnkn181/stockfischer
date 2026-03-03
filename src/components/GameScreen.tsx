import { useState, useMemo } from 'react'
import type { BotConfig, GameState } from '../types'
import Board from './Board'
import CapturedPieces from './CapturedPieces'
import MoveList from './MoveList'
import ThinkingIndicator from './ThinkingIndicator'
import ResignDialog from './ResignDialog'

interface GameScreenProps {
  bot: BotConfig
  gameState: GameState
  isThinking: boolean
  onMove: (from: string, to: string, promotion?: string) => boolean
  onResign: () => void
  kingSquare?: string
}

export default function GameScreen({
  bot,
  gameState,
  isThinking,
  onMove,
  onResign,
  kingSquare,
}: GameScreenProps) {
  const [showResignDialog, setShowResignDialog] = useState(false)

  const materialAdvantage = useMemo(() => {
    const pieceValues: Record<string, number> = {
      p: 1, P: 1, n: 3, N: 3, b: 3, B: 3, r: 5, R: 5, q: 9, Q: 9,
    }
    const whiteCapVal = gameState.capturedPieces.white.reduce(
      (sum, p) => sum + (pieceValues[p] || 0), 0
    )
    const blackCapVal = gameState.capturedPieces.black.reduce(
      (sum, p) => sum + (pieceValues[p] || 0), 0
    )
    return { white: whiteCapVal - blackCapVal, black: blackCapVal - whiteCapVal }
  }, [gameState.capturedPieces])

  return (
    <div className="flex flex-col h-full">
      {/* Bot Info */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-xl">{bot.avatar}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[var(--text-primary)]">{bot.name}</span>
            <span className="text-xs text-[var(--text-secondary)]">({bot.rating})</span>
          </div>
          {isThinking && <ThinkingIndicator />}
        </div>
        <span className="text-xs text-[var(--text-secondary)]">#{gameState.positionId}</span>
      </div>

      {/* Black captured pieces (pieces white captured) */}
      <CapturedPieces
        pieces={gameState.capturedPieces.white}
        color="white"
        advantage={materialAdvantage.white > 0 ? materialAdvantage.white : undefined}
      />

      {/* Board */}
      <Board
        fen={gameState.fen}
        legalMoves={gameState.legalMoves}
        orientation="white"
        onMove={onMove}
        isPlayerTurn={gameState.turn === 'white' && !gameState.isGameOver}
        lastMove={gameState.lastMove}
        isCheck={gameState.isCheck}
        kingSquare={kingSquare}
      />

      {/* White captured pieces (pieces black captured) */}
      <CapturedPieces
        pieces={gameState.capturedPieces.black}
        color="black"
        advantage={materialAdvantage.black > 0 ? materialAdvantage.black : undefined}
      />

      {/* Move List */}
      <MoveList moves={gameState.moveHistory} />

      {/* Resign Button */}
      <div className="mt-auto px-4 py-3">
        <button
          onClick={() => setShowResignDialog(true)}
          disabled={gameState.isGameOver}
          className="w-full py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--accent-red)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Ge upp
        </button>
      </div>

      {showResignDialog && (
        <ResignDialog
          onConfirm={() => {
            setShowResignDialog(false)
            onResign()
          }}
          onCancel={() => setShowResignDialog(false)}
        />
      )}
    </div>
  )
}
