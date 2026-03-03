export type Screen = 'home' | 'game' | 'result'

export interface BotConfig {
  id: string
  name: string
  rating: number
  description: string
  avatar: string
  skillLevel: number
  depth: number
  moveTime: number
}

export interface MoveRecord {
  san: string
  uci: string
  fen: string
}

export interface GameState {
  fen: string
  positionId: number
  turn: 'white' | 'black'
  moveHistory: MoveRecord[]
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  isGameOver: boolean
  legalMoves: Map<string, string[]>
  lastMove?: { from: string; to: string }
  capturedPieces: { white: string[]; black: string[] }
}

export type GameOutcome = 'win' | 'loss' | 'draw'
export type GameReason =
  | 'checkmate'
  | 'stalemate'
  | 'insufficient_material'
  | 'resignation'
  | 'threefold_repetition'
  | 'fifty_moves'

export interface GameResult {
  outcome: GameOutcome
  reason: GameReason
  positionId: number
  bot: BotConfig
  moveCount: number
}
