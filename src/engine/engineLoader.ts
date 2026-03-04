export interface EngineInfo {
  variant: 'lite' | 'single'
  jsFile: string
  wasmFile: string
  threads: number
}

/**
 * Detect the best Stockfish engine variant for the current device.
 */
export function detectBestEngine(): EngineInfo {
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined'
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const cores = navigator.hardwareConcurrency || 1

  if (hasSharedArrayBuffer && cores >= 2) {
    const maxThreads = isMobile ? 2 : 4
    return {
      variant: 'lite',
      jsFile: '/stockfish/stockfish-18-lite.js',
      wasmFile: '/stockfish/stockfish-18-lite.wasm',
      threads: Math.min(cores - 1, maxThreads),
    }
  }

  return getSingleThreadEngine()
}

export function getSingleThreadEngine(): EngineInfo {
  return {
    variant: 'single',
    jsFile: '/stockfish/stockfish-18-lite-single.js',
    wasmFile: '/stockfish/stockfish-18-lite-single.wasm',
    threads: 1,
  }
}
