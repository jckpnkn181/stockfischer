import { detectBestEngine, getSingleThreadEngine, type EngineInfo } from './engineLoader'
import {
  parseUciMessage,
  buildPositionCommand,
  buildGoCommand,
  buildSetOptionCommand,
  type UciMessage,
} from './uci'

export type EngineStatus = 'idle' | 'initializing' | 'ready' | 'thinking' | 'error'

export class StockfishEngine {
  private worker: Worker | null = null
  private messageHandlers: Array<(msg: UciMessage) => void> = []
  status: EngineStatus = 'idle'

  /**
   * Initialize the engine: create Worker, UCI handshake, enable Chess960.
   * Falls back from multi-threaded (lite) to single-thread on failure.
   */
  async init(): Promise<void> {
    this.status = 'initializing'

    const primary = detectBestEngine()

    try {
      await this.initWithEngine(primary)
      return
    } catch {
      this.cleanupWorker()
    }

    // Fallback: if primary was multi-threaded, try single-thread
    if (primary.variant === 'lite') {
      try {
        await this.initWithEngine(getSingleThreadEngine())
        return
      } catch {
        this.cleanupWorker()
      }
    }

    this.status = 'error'
    throw new Error('Failed to initialize Stockfish engine')
  }

  private async initWithEngine(info: EngineInfo): Promise<void> {
    this.worker = new Worker(info.jsFile)

    this.worker.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === 'string' ? e.data : String(e.data)
      const msg = parseUciMessage(line)
      for (const handler of this.messageHandlers) {
        handler(msg)
      }
    }

    this.worker.onerror = () => {
      this.status = 'error'
    }

    // UCI handshake
    this.send('uci')
    await this.waitFor((msg) => msg.type === 'uciok')

    // Enable Chess960
    this.send(buildSetOptionCommand('UCI_Chess960', 'true'))

    // Set threads if multi-threaded
    if (info.threads > 1) {
      this.send(buildSetOptionCommand('Threads', info.threads))
    }

    // Small hash table for mobile friendliness
    this.send(buildSetOptionCommand('Hash', 32))

    this.send('isready')
    await this.waitFor((msg) => msg.type === 'readyok')

    this.status = 'ready'
  }

  private cleanupWorker(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.messageHandlers = []
  }

  /**
   * Configure bot difficulty.
   * Uses Skill Level for bots below UCI_Elo minimum (1320),
   * UCI_Elo for the rest.
   */
  configure(rating: number, skillLevel?: number): void {
    if (!this.worker) return
    this.send('ucinewgame')
    if (skillLevel !== undefined) {
      this.send(buildSetOptionCommand('UCI_LimitStrength', 'false'))
      this.send(buildSetOptionCommand('Skill Level', skillLevel))
    } else {
      const clampedElo = Math.max(1320, Math.min(3190, rating))
      this.send(buildSetOptionCommand('Skill Level', 20))
      this.send(buildSetOptionCommand('UCI_LimitStrength', 'true'))
      this.send(buildSetOptionCommand('UCI_Elo', clampedElo))
    }
  }

  /**
   * Get the best move for a given position.
   */
  async getBestMove(
    fen: string,
    moves: string[],
    depth?: number,
    moveTime?: number
  ): Promise<string> {
    if (!this.worker || this.status === 'error') {
      throw new Error('Engine not ready')
    }

    this.status = 'thinking'

    this.send(buildPositionCommand(fen, moves))
    this.send('isready')
    await this.waitFor((msg) => msg.type === 'readyok')
    this.send(buildGoCommand(depth, moveTime))

    const result = await this.waitFor((msg) => msg.type === 'bestmove')

    this.status = 'ready'

    if (result.type === 'bestmove') {
      return result.move
    }

    throw new Error('Unexpected response from engine')
  }

  /**
   * Stop current calculation.
   */
  stop(): void {
    if (this.worker) {
      this.send('stop')
    }
  }

  /**
   * Destroy the engine and release resources.
   */
  destroy(): void {
    if (this.worker) {
      this.send('quit')
      this.worker.terminate()
      this.worker = null
    }
    this.messageHandlers = []
    this.status = 'idle'
  }

  private send(command: string): void {
    this.worker?.postMessage(command)
  }

  private waitFor(
    predicate: (msg: UciMessage) => boolean,
    timeoutMs = 10000
  ): Promise<UciMessage> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.removeHandler(handler)
        reject(new Error('Engine response timeout'))
      }, timeoutMs)

      const handler = (msg: UciMessage) => {
        if (predicate(msg)) {
          clearTimeout(timer)
          this.removeHandler(handler)
          resolve(msg)
        }
      }

      this.messageHandlers.push(handler)
    })
  }

  private removeHandler(handler: (msg: UciMessage) => void): void {
    const idx = this.messageHandlers.indexOf(handler)
    if (idx !== -1) this.messageHandlers.splice(idx, 1)
  }
}
