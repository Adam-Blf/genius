import { createContext, useContext, ReactNode } from 'react'
import { useFlashcardStore, FlashcardStoreReturn } from '../hooks/useFlashcardStore'

const FlashcardContext = createContext<FlashcardStoreReturn | undefined>(undefined)

export function FlashcardProvider({ children }: { children: ReactNode }) {
  const flashcardStore = useFlashcardStore()

  return (
    <FlashcardContext.Provider value={flashcardStore}>
      {children}
    </FlashcardContext.Provider>
  )
}

export function useFlashcards() {
  const context = useContext(FlashcardContext)
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardProvider')
  }
  return context
}
