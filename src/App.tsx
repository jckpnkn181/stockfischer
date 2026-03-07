import { useGame } from './hooks/useGame'
import HomeScreen from './components/HomeScreen'
import GameScreen from './components/GameScreen'
import ResultScreen from './components/ResultScreen'
import UpdatePrompt from './components/UpdatePrompt'

function App() {
  const {
    screen,
    selectedBot,
    setSelectedBot,
    positionId,
    setPositionId,
    gameState,
    gameResult,
    engineStatus,
    isThinking,
    startGame,
    playerMove,
    resign,
    playAgain,
    goHome,
    findKingSquare,
  } = useGame()

  return (
    <div className="flex flex-col h-full w-full max-w-lg">
      {screen === 'home' && (
        <HomeScreen
          selectedBot={selectedBot}
          onSelectBot={setSelectedBot}
          positionId={positionId}
          onSetPositionId={setPositionId}
          onStartGame={startGame}
          engineStatus={engineStatus}
        />
      )}

      {screen === 'game' && gameState && selectedBot && (
        <GameScreen
          bot={selectedBot}
          gameState={gameState}
          isThinking={isThinking}
          onMove={playerMove}
          onResign={resign}
          kingSquare={findKingSquare()}
        />
      )}

      {screen === 'result' && gameResult && (
        <ResultScreen
          result={gameResult}
          onPlayAgain={playAgain}
          onChangeBot={goHome}
        />
      )}

      {!['home', 'game', 'result'].includes(screen) && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">♔</div>
            <p className="text-[var(--text-secondary)]">Laddar...</p>
          </div>
        </div>
      )}

      <UpdatePrompt />
    </div>
  )
}

export default App
