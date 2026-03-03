export type UciMessage =
  | { type: 'uciok' }
  | { type: 'readyok' }
  | { type: 'bestmove'; move: string; ponder?: string }
  | { type: 'info'; depth?: number; score?: { cp?: number; mate?: number }; pv?: string }
  | { type: 'unknown'; raw: string }

/**
 * Parse a UCI protocol message line.
 */
export function parseUciMessage(line: string): UciMessage {
  const trimmed = line.trim()

  if (trimmed === 'uciok') return { type: 'uciok' }
  if (trimmed === 'readyok') return { type: 'readyok' }

  if (trimmed.startsWith('bestmove')) {
    const parts = trimmed.split(/\s+/)
    return {
      type: 'bestmove',
      move: parts[1],
      ponder: parts[3],
    }
  }

  if (trimmed.startsWith('info')) {
    const msg: UciMessage = { type: 'info' }

    const depthMatch = trimmed.match(/\bdepth\s+(\d+)/)
    if (depthMatch) msg.depth = parseInt(depthMatch[1])

    const cpMatch = trimmed.match(/\bscore\s+cp\s+(-?\d+)/)
    if (cpMatch) msg.score = { cp: parseInt(cpMatch[1]) }

    const mateMatch = trimmed.match(/\bscore\s+mate\s+(-?\d+)/)
    if (mateMatch) msg.score = { mate: parseInt(mateMatch[1]) }

    const pvMatch = trimmed.match(/\bpv\s+(.+)$/)
    if (pvMatch) msg.pv = pvMatch[1]

    return msg
  }

  return { type: 'unknown', raw: trimmed }
}

/**
 * Build UCI position command.
 */
export function buildPositionCommand(fen: string, moves: string[]): string {
  const base = `position fen ${fen}`
  return moves.length > 0 ? `${base} moves ${moves.join(' ')}` : base
}

/**
 * Build UCI go command.
 */
export function buildGoCommand(depth?: number, moveTime?: number): string {
  const parts = ['go']
  if (depth !== undefined) parts.push(`depth ${depth}`)
  if (moveTime !== undefined) parts.push(`movetime ${moveTime}`)
  return parts.join(' ')
}

/**
 * Build UCI setoption command.
 */
export function buildSetOptionCommand(name: string, value: string | number): string {
  return `setoption name ${name} value ${value}`
}
