export interface EngineSettings {
  depth: number
  moveTime: number
  skillLevel?: number
}

export function getEngineSettings(rating: number): EngineSettings {
  if (rating <= 1300) {
    // Low ratings: use Skill Level (0-10), shallow depth, fast moves
    const t = (rating - 200) / 1100 // 0..1 over 200-1300
    const skillLevel = Math.round(1 + t * 9) // 1-10
    const depth = Math.round(1 + t * 7) // 1-8
    const moveTime = Math.round(200 + t * 300) // 200-500ms
    return { depth, moveTime, skillLevel }
  }

  // Higher ratings: use UCI_Elo (handled by engine.configure), deeper search
  const t = (rating - 1300) / 1900 // 0..1 over 1300-3200
  const depth = Math.round(8 + t * 16) // 8-24
  const moveTime = Math.round(500 + t * 1500) // 500-2000ms
  return { depth, moveTime }
}
