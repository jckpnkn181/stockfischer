const PIECE_SYMBOLS: Record<string, string> = {
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕',
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛',
}

const PIECE_VALUES: Record<string, number> = {
  p: 1, P: 1, n: 3, N: 3, b: 3, B: 3, r: 5, R: 5, q: 9, Q: 9,
}

interface CapturedPiecesProps {
  pieces: string[]
  color: 'white' | 'black'
  advantage?: number
}

export default function CapturedPieces({ pieces, color, advantage }: CapturedPiecesProps) {
  const sorted = [...pieces].sort(
    (a, b) => (PIECE_VALUES[b] || 0) - (PIECE_VALUES[a] || 0)
  )

  return (
    <div className={`flex items-center h-6 px-2 text-sm ${color === 'white' ? 'text-gray-300' : 'text-gray-500'}`}>
      <div className="flex gap-0.5">
        {sorted.map((piece, i) => (
          <span key={i} className="text-base leading-none">
            {PIECE_SYMBOLS[piece] || piece}
          </span>
        ))}
      </div>
      {advantage !== undefined && advantage > 0 && (
        <span className="ml-1 text-xs text-[var(--text-secondary)]">+{advantage}</span>
      )}
    </div>
  )
}
