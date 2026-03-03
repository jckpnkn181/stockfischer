# Chess960 PWA — Projektbrief

## Översikt

Bygg en Progressive Web App (PWA) där spelaren spelar Chess960 (Fischer Random Chess) mot Stockfish 18. Appen ska kännas som en nativ mobilapp — fullskärm, ingen adressfältsfält, installerbar på hemskärmen. Teknikstack: React med TypeScript.

---

## Kärnfunktionalitet

### 1. Chess960-spel mot Stockfish
- Spelaren väljer en förinställd bot med en viss styrka (liknande Chess.com's bot-system)
- Spelaren väljer startposition: antingen slumpmässig (random) eller en specifik av de 960 möjliga positionerna
- Partiet spelas i realtid mot Stockfish som kör i webbläsaren via WebAssembly

### 2. Bot-system med förinställda svårighetsgrader
- Varje bot har ett namn, en rating, och en personlighet/avatar
- Styrkan styrs genom en kombination av:
  - `Skill Level` (Stockfish UCI-parameter, 0–20)
  - Sökdjup (begränsa `depth`)
  - Tänketid (begränsa `movetime`)
- Exempelbotar (anpassa efter behov):
  - Nybörjare (~400): Skill Level 1, depth 2
  - Casual (~800): Skill Level 5, depth 4
  - Klubbspelare (~1200): Skill Level 10, depth 8
  - Stark (~1600): Skill Level 14, depth 12
  - Expert (~2000): Skill Level 17, depth 16
  - Mästare (~2500): Skill Level 20, depth 20+

### 3. Chess960-specifik hantering
- Alla 960 startpositioner stöds, numrerade 0–959
- Varje position definieras av en FEN-sträng som skickas till Stockfish
- Rockad i Chess960 kräver speciell hantering — kungens och tornets startpositioner varierar
- UCI-kommando: `setoption name UCI_Chess960 value true` måste skickas vid init
- chess.js stödjer Chess960 men det måste aktiveras explicit

---

## Stockfish 18 — WebAssembly-integration

### npm-paket
- Paket: `stockfish` (npm) av Nathan Rugg — https://github.com/nmrugg/stockfish.js
- Aktuell version: 18.0.5 (uppdaterad till Stockfish 18)
- Detta är samma paket som Chess.com använder i sin webbläsar-motor
- Licens: GPLv3 — Stockfish-koden i sig är GPL, men din app-kod (React UI) som anropar Stockfish via UCI förblir din

### Fem varianter (flavors)
1. **Fullversion multitråd** (~100+ MB) — Starkast, kräver CORS-headers, rekommenderad för desktop
2. **Fullversion single-thread** — Samma styrka, funkar utan CORS
3. **Lite multitråd** (~7 MB) — Rekommenderad för mobil med CORS
4. **Lite single-thread** — Minsta WASM-varianten, mobil utan CORS
5. **Ren JavaScript** (~10 MB) — Sista utvägen, väldigt långsam

### Rekommenderad laddningsstrategi
Dynamiskt ladda rätt variant baserat på enhet:
- **Desktop + CORS** → Fullversion multitråd
- **Mobil + CORS** → Lite multitråd
- **Fallback** → Single-thread-variant

Eftersom du kontrollerar servern, sätt alltid dessa CORS-headers:
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```
Då får alla enheter multitråd automatiskt.

### Kommunikation med Stockfish
Stockfish körs i en Web Worker och kommuniceras med via UCI-protokoll:
```javascript
// Initiering
worker.postMessage('uci');
worker.postMessage('setoption name UCI_Chess960 value true');
worker.postMessage('setoption name Skill Level value 10');
worker.postMessage('isready');

// Starta sökning
worker.postMessage('position fen <chess960-fen> moves e2e4 e7e5');
worker.postMessage('go depth 12 movetime 2000');

// Lyssna på svar
worker.onmessage = (e) => {
  if (e.data.startsWith('bestmove')) {
    // Hantera draget
  }
};
```

---

## Stockfish 18 — Vad som är nytt

Från blogginlägget (https://stockfishchess.org/blog/2026/stockfish-18/):
- **+46 Elo** mot Stockfish 17
- **SFNNv10-nätverksarkitektur** med "Threat Inputs" — motorn "ser" hotade pjäser bättre
- **Shared Memory** — processer kan dela minnesrymd för neurala nätverksvikter (relevant för server-side, mindre för WASM)
- **Correction History** — dynamisk justering av evalueringar baserat på sökmönster
- **Förbättrat Chess960-spel** — specifikt omnämnt att kvaliteten förbättrats i Fischer Random Chess
- **Förbättrad ställmatt- och fästningsdetektering**

---

## UI/UX — Mörkt app-tema (inspirerat av Chess.com)

### Design-principer
- Mörkt tema som standard (liknande Chess.com's mörka läge)
- Fullskärmsläge utan webbläsar-UI
- Touch-optimerat för mobil: stora klickområden, drag-and-drop av pjäser
- Smooth animationer vid drag
- Responsivt: brädet tar upp maximal yta på alla skärmstorlekar

### Skärmar/Vyer
1. **Startskärm** — Välj bot (svårighetsgrad) + välj startposition (random/specifik)
2. **Spelskärm** — Schackbräde, klocka/timer, fångade pjäser, möjlighet att ge upp
3. **Resultatskärm** — Vinst/förlust/remi, möjlighet att spela igen

### Partianalys (framtida feature)
- Liknande Chess.com's "Partigranskning" som syns i de uppladdade skärmbilderna
- Stockfish analyserar varje drag och klassificerar dem:
  - Briljant, Toppen, Bäst, Utmärkt, Bra, Bok, Ogenomtänkt, Misstag, Miss, Blunder
- Klassificeringen baseras på centipawn loss (cp-förlust) — skillnaden mellan spelarens drag och motorns bästa drag
- "Briljant" kräver extra logik: draget måste vara svårt att hitta för en människa, ofta det enda bra draget, gärna en uppoffring
- Precision-poäng: viktat genomsnitt av hur nära dragen låg motorns bästa val
- Partirating: en bedömning av spelets kvalitet

---

## PWA-konfiguration

### Manifest (manifest.json)
```json
{
  "name": "Chess960",
  "short_name": "Chess960",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#1a1a1a",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Meta-taggar för app-känsla
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#1a1a1a">
<link rel="manifest" href="/manifest.json">
```

### Service Worker
- Cacha statiska tillgångar (HTML, CSS, JS, WASM-filer) för offline-stöd
- Stockfish WASM-filerna bör cachas efter första laddningen

---

## Teknikstack

| Komponent | Teknologi |
|-----------|-----------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Schacklogik | chess.js (med Chess960-stöd) |
| Schackmotor | Stockfish 18 via `stockfish` npm-paket (WASM) |
| Bräde-rendering | Eget eller chessboard-liknande komponent |
| Bundler | Vite |
| PWA | vite-plugin-pwa |
| Hosting | Valfritt (Vercel, Netlify, egen server) — se till att CORS-headers sätts |

---

## Bibliotek och beroenden

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "chess.js": "^1.0",
    "stockfish": "^18.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "vite": "^5",
    "vite-plugin-pwa": "^0.17",
    "@types/react": "^18",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
```

---

## Filstruktur (förslag)

```
chess960-pwa/
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   ├── icon-512.png
│   └── stockfish/          # WASM-filer kopieras hit
│       ├── stockfish-18.js
│       ├── stockfish-18.wasm
│       ├── stockfish-18-lite.js
│       └── stockfish-18-lite.wasm
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Board.tsx         # Schackbrädet
│   │   ├── Piece.tsx         # Enskild pjäs
│   │   ├── BotSelector.tsx   # Välj bot/svårighet
│   │   ├── PositionPicker.tsx # Välj Chess960-position
│   │   ├── GameScreen.tsx    # Spelvyn
│   │   ├── ResultScreen.tsx  # Resultat efter parti
│   │   └── MoveList.tsx      # Draglista
│   ├── engine/
│   │   ├── stockfish.ts      # Stockfish Web Worker wrapper
│   │   ├── engineLoader.ts   # Dynamisk laddning av rätt WASM-variant
│   │   └── uci.ts            # UCI-protokoll parser
│   ├── chess960/
│   │   ├── positions.ts      # Alla 960 startpositioner / FEN-generator
│   │   └── castling.ts       # Chess960-rockad-logik
│   ├── bots/
│   │   └── botConfig.ts      # Förinställda botar med namn, rating, Skill Level etc
│   ├── hooks/
│   │   ├── useStockfish.ts   # React hook för Stockfish-kommunikation
│   │   └── useGame.ts        # Spelets state management
│   ├── types/
│   │   └── index.ts          # TypeScript-typer
│   └── styles/
│       └── globals.css       # Tailwind + globala stilar
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Viktiga tekniska detaljer

### Chess960 FEN-generering
De 960 positionerna kan genereras algoritmiskt utifrån positionsnummer (0–959) enligt Fischers numreringssystem. Reglerna:
1. Biskoparna måste stå på olika färger
2. Kungen måste stå mellan tornen
3. Alla pjäser på rad 1 (vit) speglas till rad 8 (svart)

### Rockad i Chess960
- I Chess960 anges rockad med kungens start- och slutruta, INTE med standardnotation (e.g. "e1g1")
- Alternativt kan man använda "King takes own Rook" notation
- Stockfish hanterar detta korrekt med `UCI_Chess960 = true`
- UI:t måste visa rockaden korrekt oavsett var kung och torn startade

### Webbläsarstöd
Stockfish WASM funkar på:
- Chrome/Edge (alla moderna versioner)
- Firefox (alla moderna versioner)  
- Safari (macOS 11+, iOS 16+)
- Android Chrome

### Prestanda på mobil
- Lite-varianten (~7 MB) rekommenderas för mobil
- Även lite-versionen är mycket starkare än mänskliga spelare
- Skill Level-begränsningen gör att motorstyrkan inte spelar roll — alla varianter kan spela på alla bot-nivåer

---

## Framtida features (efter MVP)

- Partianalys med drag-klassificering (Briljant, Blunder etc.) — se Chess.com-skärmbilderna
- Precision-poäng per parti
- Spelhistorik (sparad lokalt)
- Statistik per bot (vinster/förluster)
- Tidskontroll (blitz, rapid, classical)
- Ljudeffekter vid drag
- Haptic feedback (Vibration API) på mobil
- Öppningsbok-visning för Chess960-positioner
- Dela parti via länk
