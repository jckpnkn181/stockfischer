import type { BotConfig } from '../types'

interface BotCardProps {
  bot: BotConfig
  selected: boolean
  onSelect: (bot: BotConfig) => void
}

export default function BotCard({ bot, selected, onSelect }: BotCardProps) {
  return (
    <button
      onClick={() => onSelect(bot)}
      className={`flex flex-col items-center p-4 rounded-xl transition-all cursor-pointer ${
        selected
          ? 'bg-[var(--bg-tertiary)] ring-2 ring-[var(--accent-green)]'
          : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
      }`}
    >
      <span className="text-3xl mb-1">{bot.avatar}</span>
      <span className="font-bold text-[var(--text-primary)]">{bot.name}</span>
      <span className="text-xs text-[var(--accent-green)] font-medium">{bot.rating}</span>
      <span className="text-xs text-[var(--text-secondary)] mt-1 text-center leading-tight">
        {bot.description}
      </span>
    </button>
  )
}
