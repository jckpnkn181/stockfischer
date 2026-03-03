import { useRef, useEffect } from 'react'
import type { MoveRecord } from '../types'

interface MoveListProps {
  moves: MoveRecord[]
}

export default function MoveList({ moves }: MoveListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [moves])

  if (moves.length === 0) return null

  // Group moves into pairs
  const pairs: Array<{ number: number; white: string; black?: string }> = []
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i].san,
      black: moves[i + 1]?.san,
    })
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-1 overflow-x-auto px-2 py-1.5 text-sm scrollbar-hide"
      style={{ scrollbarWidth: 'none' }}
    >
      {pairs.map((pair) => (
        <div key={pair.number} className="flex shrink-0 gap-0.5">
          <span className="text-[var(--text-secondary)]">{pair.number}.</span>
          <span className="text-[var(--text-primary)] font-medium">{pair.white}</span>
          {pair.black && (
            <span className="text-[var(--text-primary)] font-medium">{pair.black}</span>
          )}
        </div>
      ))}
    </div>
  )
}
