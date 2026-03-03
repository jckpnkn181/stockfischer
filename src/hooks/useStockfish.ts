import { useState, useEffect, useRef, useCallback } from 'react'
import { StockfishEngine, type EngineStatus } from '../engine/stockfish'

export function useStockfish() {
  const engineRef = useRef<StockfishEngine | null>(null)
  const [status, setStatus] = useState<EngineStatus>('idle')
  const [isThinking, setIsThinking] = useState(false)

  useEffect(() => {
    let cancelled = false
    const engine = new StockfishEngine()
    engineRef.current = engine

    engine.init().then(() => {
      if (!cancelled) setStatus('ready')
    }).catch(() => {
      if (!cancelled) setStatus('error')
    })

    return () => {
      cancelled = true
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  const configure = useCallback((skillLevel: number) => {
    engineRef.current?.configure(skillLevel)
  }, [])

  const getMove = useCallback(async (
    fen: string,
    moves: string[],
    depth?: number,
    moveTime?: number
  ): Promise<string> => {
    if (!engineRef.current) throw new Error('Engine not initialized')

    setIsThinking(true)
    try {
      const move = await engineRef.current.getBestMove(fen, moves, depth, moveTime)
      return move
    } finally {
      setIsThinking(false)
    }
  }, [])

  const stopThinking = useCallback(() => {
    engineRef.current?.stop()
    setIsThinking(false)
  }, [])

  return { status, isThinking, configure, getMove, stopThinking }
}
