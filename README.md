# Stockfischer ♔

Chess960 (Fischer Random Chess) PWA — spela mot Stockfish 18 direkt i webbläsaren.

## Features

- All 960 starting positions with Scharnagl numbering
- Stockfish 18 via WebAssembly (multi-thread with fallback)  
- 6 bot difficulty levels (400–2500 Elo)
- Chess960 castling handled correctly
- Dark theme, touch-optimized, installable PWA
- Offline support via Service Worker

## Tech Stack

React + TypeScript, chessops, Stockfish 18 WASM, Vite, Tailwind CSS, hosted on Vercel.

## Development

npm install
npm run dev

Visit https://stockfischer.vercel.app for the live version.
