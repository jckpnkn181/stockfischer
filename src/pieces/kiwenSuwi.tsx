import wP from '../assets/kiwen-suwi/white-pawn.svg'
import wN from '../assets/kiwen-suwi/white-knight.svg'
import wB from '../assets/kiwen-suwi/white-bishop.svg'
import wR from '../assets/kiwen-suwi/white-rook.svg'
import wQ from '../assets/kiwen-suwi/white-queen.svg'
import wK from '../assets/kiwen-suwi/white-king.svg'
import bP from '../assets/kiwen-suwi/black-pawn.svg'
import bN from '../assets/kiwen-suwi/black-knight.svg'
import bB from '../assets/kiwen-suwi/black-bishop.svg'
import bR from '../assets/kiwen-suwi/black-rook.svg'
import bQ from '../assets/kiwen-suwi/black-queen.svg'
import bK from '../assets/kiwen-suwi/black-king.svg'

// react-chessboard uses keys like wP, wN, bK etc.
const boardPieces: Record<string, string> = {
  wP, wN, wB, wR, wQ, wK,
  bP, bN, bB, bR, bQ, bK,
}

// FEN character → SVG url (for PieceImg)
const fenPieces: Record<string, string> = {
  P: wP, N: wN, B: wB, R: wR, Q: wQ, K: wK,
  p: bP, n: bN, b: bB, r: bR, q: bQ, k: bK,
}

export const kiwenSuwiPieces: Record<string, () => React.JSX.Element> =
  Object.fromEntries(
    Object.entries(boardPieces).map(([key, src]) => [
      key,
      () => (
        <img
          src={src}
          alt={key}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ),
    ])
  )

export function PieceImg({ piece, size = '1rem' }: { piece: string; size?: string }) {
  const src = fenPieces[piece]
  if (!src) return null
  return <img src={src} alt={piece} style={{ width: size, height: size, objectFit: 'contain' }} />
}
