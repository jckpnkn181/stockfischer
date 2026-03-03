import { Chess } from 'chessops/chess'
import { parseFen, makeFen } from 'chessops/fen'
import { chessgroundDests } from 'chessops/compat'
import { parseSquare, makeSquare, type Square } from 'chessops'
import { makeSan } from 'chessops/san'
import type { GameState, MoveRecord } from '../types'

/**
 * Create a Chess position from a FEN string.
 */
export function createGame(fen: string): Chess {
  const setup = parseFen(fen).unwrap()
  return Chess.fromSetup(setup).unwrap()
}

/**
 * Get legal moves in a Map<squareName, destSquareNames[]> format.
 * Uses Chess960 mode for proper castling destinations.
 */
export function getLegalMoves(pos: Chess): Map<string, string[]> {
  return chessgroundDests(pos, { chess960: true })
}

/**
 * Make a move on a position. Returns new position, SAN, UCI, and new FEN.
 * For Chess960 castling, the king moves to the rook's square.
 */
export function makeMove(
  pos: Chess,
  from: string,
  to: string,
  promotion?: 'queen' | 'rook' | 'bishop' | 'knight'
): { pos: Chess; san: string; uci: string; fen: string } | null {
  const fromSq = parseSquare(from)
  const toSq = parseSquare(to)
  if (fromSq === undefined || toSq === undefined) return null

  const move = { from: fromSq, to: toSq, promotion } as {
    from: Square
    to: Square
    promotion?: 'queen' | 'rook' | 'bishop' | 'knight'
  }

  // Check if it's a legal move
  if (!pos.isLegal(move)) return null

  const san = makeSan(pos, move)
  const uci = makeSquare(fromSq) + makeSquare(toSq) + (promotion ? promotion[0] : '')

  const newPos = pos.clone()
  newPos.play(move)

  return {
    pos: newPos,
    san,
    uci,
    fen: makeFen(newPos.toSetup()),
  }
}

/**
 * Build a complete GameState from a position and history.
 */
export function getGameState(
  pos: Chess,
  history: MoveRecord[],
  positionId: number,
  initialFen: string
): GameState {
  const outcome = pos.outcome()
  const isCheckmate = pos.isCheckmate()
  const isStalemate = pos.isStalemate()
  const isDraw = outcome !== undefined && outcome.winner === undefined
  const isGameOver = outcome !== undefined

  const lastMove = history.length > 0
    ? parseUciToSquares(history[history.length - 1].uci)
    : undefined

  return {
    fen: makeFen(pos.toSetup()),
    positionId,
    turn: pos.turn === 'white' ? 'white' : 'black',
    moveHistory: history,
    isCheck: pos.isCheck(),
    isCheckmate,
    isStalemate,
    isDraw,
    isGameOver,
    legalMoves: getLegalMoves(pos),
    lastMove,
    capturedPieces: getCapturedPieces(pos, initialFen),
  }
}

/**
 * Parse a UCI move string to from/to squares.
 */
function parseUciToSquares(uci: string): { from: string; to: string } {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
  }
}

/**
 * Calculate captured pieces by comparing current material to initial material.
 */
export function getCapturedPieces(
  pos: Chess,
  initialFen: string
): { white: string[]; black: string[] } {
  const initialSetup = parseFen(initialFen).unwrap()
  const initialPos = Chess.fromSetup(initialSetup).unwrap()

  const initialMaterial = countMaterial(initialPos)
  const currentMaterial = countMaterial(pos)

  const whiteCaptured: string[] = [] // black pieces captured by white
  const blackCaptured: string[] = [] // white pieces captured by black

  const roles: Array<'pawn' | 'knight' | 'bishop' | 'rook' | 'queen'> = [
    'queen', 'rook', 'bishop', 'knight', 'pawn',
  ]
  const symbols: Record<string, string> = {
    pawn: 'p', knight: 'n', bishop: 'b', rook: 'r', queen: 'q',
  }

  for (const role of roles) {
    // Black pieces captured (by white) = initial black - current black
    const blackLost = initialMaterial.black[role] - currentMaterial.black[role]
    for (let i = 0; i < blackLost; i++) whiteCaptured.push(symbols[role])

    // White pieces captured (by black) = initial white - current white
    const whiteLost = initialMaterial.white[role] - currentMaterial.white[role]
    for (let i = 0; i < whiteLost; i++) blackCaptured.push(symbols[role].toUpperCase())
  }

  return { white: whiteCaptured, black: blackCaptured }
}

function countMaterial(pos: Chess): {
  white: Record<string, number>
  black: Record<string, number>
} {
  const board = pos.board
  const result = {
    white: { pawn: 0, knight: 0, bishop: 0, rook: 0, queen: 0 },
    black: { pawn: 0, knight: 0, bishop: 0, rook: 0, queen: 0 },
  }

  for (const color of ['white', 'black'] as const) {
    for (const role of ['pawn', 'knight', 'bishop', 'rook', 'queen'] as const) {
      result[color][role] = board[role].intersect(board[color]).size()
    }
  }

  return result
}
