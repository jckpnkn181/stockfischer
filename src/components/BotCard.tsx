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
      className={`flex flex-col items-center p-2.5 rounded-xl transition-all cursor-pointer ${
        selected
          ? 'bg-[var(--bg-tertiary)] ring-2 ring-[var(--accent-green)]'
          : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]'
      }`}
    >
      <img src={bot.avatar} alt={bot.name} className="w-10 h-10 rounded-full mb-1" />
      <span className="font-bold text-sm text-[var(--text-primary)]">{bot.name}</span>
      <span className="text-xs text-[var(--accent-green)] font-medium">{bot.rating}</span>
    </button>
  )
}
