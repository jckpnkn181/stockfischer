export interface EngineInfo {
  variant: 'full' | 'lite' | 'single'
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

  if (hasSharedArrayBuffer && !isMobile && cores >= 4) {
    return {
      variant: 'full',
      jsFile: '/stockfish/stockfish-18.js',
      wasmFile: '/stockfish/stockfish-18.wasm',
      threads: Math.min(cores - 1, 4),
    }
  }

  if (hasSharedArrayBuffer) {
    return {
      variant: 'lite',
      jsFile: '/stockfish/stockfish-18-lite.js',
      wasmFile: '/stockfish/stockfish-18-lite.wasm',
      threads: Math.min(cores - 1, 2),
    }
  }

  return {
    variant: 'single',
    jsFile: '/stockfish/stockfish-18-lite-single.js',
    wasmFile: '/stockfish/stockfish-18-lite-single.wasm',
    threads: 1,
  }
}
