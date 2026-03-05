export type Screen = 'home' | 'game' | 'result'

export type BotCategory =
  | 'Nybörjare' | 'Medelsvår' | 'Avancerad' | 'Expert'
  | 'Mästare' | 'Grandmaster' | 'Super Grandmaster' | 'Maximal'

export interface BotConfig {
  id: string
  name: string
  rating: number
  category: BotCategory
  avatar: string
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
