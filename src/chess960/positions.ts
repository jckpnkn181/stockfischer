/**
 * Chess960 position generation using the Scharnagl numbering (0-959).
 */

const KNIGHT_PLACEMENTS: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 2], [1, 3], [1, 4],
  [2, 3], [2, 4],
  [3, 4],
]

/**
 * Convert a Chess960 position ID (0-959) to a back rank piece array.
 * Uses the Scharnagl algorithm.
 */
export function positionIdToBackRank(id: number): string[] {
  const rank = new Array<string>(8).fill('')

  // Step 1: Light-squared bishop (squares 1,3,5,7)
  const n1 = id % 4
  rank[n1 * 2 + 1] = 'b'
  let remainder = Math.floor(id / 4)

  // Step 2: Dark-squared bishop (squares 0,2,4,6)
  const n2 = remainder % 4
  rank[n2 * 2] = 'b'
  remainder = Math.floor(remainder / 4)

  // Step 3: Queen placement among 6 remaining squares
  const n3 = remainder % 6
  remainder = Math.floor(remainder / 6)

  // Step 4: Knights from lookup table among 5 remaining squares
  const knightPair = KNIGHT_PLACEMENTS[remainder]

  // Find empty squares and place queen, then knights, then rook-king-rook
  const emptySquares: number[] = []
  for (let i = 0; i < 8; i++) {
    if (rank[i] === '') emptySquares.push(i)
  }

  // Place queen
  rank[emptySquares[n3]] = 'q'
  emptySquares.splice(n3, 1)

  // Place knights (among remaining 5 squares)
  rank[emptySquares[knightPair[1]]] = 'n'
  // Remove the second knight's index first (higher index)
  emptySquares.splice(knightPair[1], 1)
  rank[emptySquares[knightPair[0]]] = 'n'
  emptySquares.splice(knightPair[0], 1)

  // Remaining 3 squares: rook, king, rook
  rank[emptySquares[0]] = 'r'
  rank[emptySquares[1]] = 'k'
  rank[emptySquares[2]] = 'r'

  return rank
}

/**
 * Generate a full Chess960 FEN from a position ID.
 * Includes proper Chess960 castling rights based on rook positions.
 */
export function generateChess960Fen(positionId: number): string {
  const backRank = positionIdToBackRank(positionId)
  const backRankStr = backRank.join('')

  // Find rook and king positions for castling rights
  const files = 'abcdefgh'
  let castling = ''
  const rookPositions: number[] = []
  for (let i = 0; i < 8; i++) {
    if (backRank[i] === 'r') rookPositions.push(i)
  }

  // Chess960 castling notation uses file letters
  // Uppercase for white, the rook files
  if (rookPositions.length === 2) {
    // King-side rook (higher file) gets uppercase file letter
    castling += files[rookPositions[1]].toUpperCase()
    // Queen-side rook (lower file) gets uppercase file letter
    castling = files[rookPositions[0]].toUpperCase() + castling

    // Actually: standard convention is H-side first, A-side second
    // But FEN uses: KQkq order where K=kingside, Q=queenside
    // For Chess960: we use the file letters, higher file = 'K'-side
    castling = files[rookPositions[1]].toUpperCase() + files[rookPositions[0]].toUpperCase()
    castling += files[rookPositions[1]] + files[rookPositions[0]]
  }

  const blackBackRank = backRankStr
  const whiteBackRank = backRankStr.toUpperCase()

  return `${blackBackRank}/pppppppp/8/8/8/8/PPPPPPPP/${whiteBackRank} w ${castling} - 0 1`
}

/**
 * Generate a random Chess960 position ID (0-959).
 */
export function randomPositionId(): number {
  return Math.floor(Math.random() * 960)
}

/**
 * The standard chess starting position is Chess960 position #518.
 */
export const STANDARD_POSITION_ID = 518
