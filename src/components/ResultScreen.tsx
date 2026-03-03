import type { GameResult } from '../types'

interface ResultScreenProps {
  result: GameResult
  onPlayAgain: () => void
  onChangeBot: () => void
}

const OUTCOME_CONFIG = {
  win: { icon: '🎉', title: 'Vinst!', color: 'text-[var(--accent-green)]' },
  loss: { icon: '😔', title: 'Förlust', color: 'text-[var(--accent-red)]' },
  draw: { icon: '🤝', title: 'Remi', color: 'text-[var(--text-secondary)]' },
} as const

const REASON_TEXT: Record<string, string> = {
  checkmate: 'Schackmatt',
  stalemate: 'Patt',
  insufficient_material: 'Otillräckligt material',
  resignation: 'Uppgivet',
  threefold_repetition: 'Trefaldig upprepning',
  fifty_moves: '50-dragsregeln',
}

export default function ResultScreen({ result, onPlayAgain, onChangeBot }: ResultScreenProps) {
  const config = OUTCOME_CONFIG[result.outcome]

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      {/* Result */}
      <span className="text-6xl mb-4">{config.icon}</span>
      <h2 className={`text-3xl font-bold mb-1 ${config.color}`}>{config.title}</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        {REASON_TEXT[result.reason] || result.reason}
      </p>

      {/* Game Info */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-4 w-full max-w-sm mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{result.bot.avatar}</span>
          <div>
            <span className="font-bold text-[var(--text-primary)]">{result.bot.name}</span>
            <span className="text-xs text-[var(--text-secondary)] ml-2">({result.bot.rating})</span>
          </div>
        </div>
        <div className="flex justify-between text-sm text-[var(--text-secondary)]">
          <span>Position #{result.positionId}</span>
          <span>{result.moveCount} drag</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={onPlayAgain}
          className="w-full py-3.5 rounded-xl font-bold text-lg bg-[var(--accent-green)] text-white hover:bg-[var(--accent-green-hover)] transition cursor-pointer"
        >
          Spela igen
        </button>
        <button
          onClick={onChangeBot}
          className="w-full py-3 rounded-xl font-medium bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition cursor-pointer"
        >
          Byt motståndare
        </button>
      </div>
    </div>
  )
}
