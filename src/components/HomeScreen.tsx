import { useState } from 'react'
import type { BotConfig } from '../types'
import { bots } from '../bots/botConfig'
import { randomPositionId } from '../chess960/positions'
import BotCard from './BotCard'

interface HomeScreenProps {
  selectedBot: BotConfig | null
  onSelectBot: (bot: BotConfig) => void
  positionId: number
  onSetPositionId: (id: number) => void
  onStartGame: (bot: BotConfig, posId: number) => void
  engineReady: boolean
}

export default function HomeScreen({
  selectedBot,
  onSelectBot,
  positionId,
  onSetPositionId,
  onStartGame,
  engineReady,
}: HomeScreenProps) {
  const [inputValue, setInputValue] = useState(positionId.toString())

  const handleRandomize = () => {
    const id = randomPositionId()
    onSetPositionId(id)
    setInputValue(id.toString())
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    const num = parseInt(value)
    if (!isNaN(num) && num >= 0 && num <= 959) {
      onSetPositionId(num)
    }
  }

  const handleStart = () => {
    if (selectedBot) {
      onStartGame(selectedBot, positionId)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="text-center pt-8 pb-4 px-4">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Chess960</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Välj motståndare och position</p>
      </div>

      {/* Bot Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-4 pb-4">
        {bots.map((bot) => (
          <BotCard
            key={bot.id}
            bot={bot}
            selected={selectedBot?.id === bot.id}
            onSelect={onSelectBot}
          />
        ))}
      </div>

      {/* Position Selector */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 bg-[var(--bg-secondary)] rounded-xl p-3">
          <label className="text-sm text-[var(--text-secondary)] shrink-0">Position:</label>
          <input
            type="number"
            min={0}
            max={959}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-20 bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-center rounded-lg py-1.5 px-2 text-sm outline-none focus:ring-1 focus:ring-[var(--accent-green)]"
          />
          <button
            onClick={handleRandomize}
            className="px-3 py-1.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg text-sm hover:brightness-110 transition cursor-pointer"
          >
            Slumpa
          </button>
          <span className="text-xs text-[var(--text-secondary)] ml-auto">0–959</span>
        </div>
      </div>

      {/* Start Button */}
      <div className="px-4 pb-8 mt-auto">
        <button
          onClick={handleStart}
          disabled={!selectedBot || !engineReady}
          className="w-full py-3.5 rounded-xl font-bold text-lg transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 bg-[var(--accent-green)] text-white hover:bg-[var(--accent-green-hover)]"
        >
          {!engineReady ? 'Laddar motor...' : 'Spela'}
        </button>
      </div>
    </div>
  )
}
