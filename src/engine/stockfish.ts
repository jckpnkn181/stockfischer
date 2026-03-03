import { detectBestEngine, type EngineInfo } from './engineLoader'
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
  private engineInfo: EngineInfo | null = null
  status: EngineStatus = 'idle'

  /**
   * Initialize the engine: create Worker, UCI handshake, enable Chess960.
   */
  async init(): Promise<void> {
    this.status = 'initializing'

    try {
      this.engineInfo = detectBestEngine()
      this.worker = new Worker(this.engineInfo.jsFile)

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
      if (this.engineInfo.threads > 1) {
        this.send(buildSetOptionCommand('Threads', this.engineInfo.threads))
      }

      // Small hash table for mobile friendliness
      this.send(buildSetOptionCommand('Hash', 32))

      this.send('isready')
      await this.waitFor((msg) => msg.type === 'readyok')

      this.status = 'ready'
    } catch {
      this.status = 'error'
      throw new Error('Failed to initialize Stockfish engine')
    }
  }

  /**
   * Configure bot difficulty (Skill Level).
   */
  configure(skillLevel: number): void {
    if (!this.worker) return
    this.send(buildSetOptionCommand('Skill Level', skillLevel))
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
