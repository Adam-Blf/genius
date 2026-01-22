import { AuthProvider } from './contexts/AuthContext'
import { GameProvider } from './contexts/GameContext'
import { FlashcardProvider } from './contexts/FlashcardContext'
import { AppRouter } from './routes'

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <FlashcardProvider>
          <AppRouter />
        </FlashcardProvider>
      </GameProvider>
    </AuthProvider>
  )
}
