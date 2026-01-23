/**
 * User Data Context
 * Provides centralized access to user's local data
 */

import { createContext, useContext, ReactNode } from 'react'
import { useUserDataStore, UserDataStoreReturn } from '../hooks/useUserDataStore'

const UserDataContext = createContext<UserDataStoreReturn | undefined>(undefined)

export function UserDataProvider({ children }: { children: ReactNode }) {
  const userDataStore = useUserDataStore()

  return (
    <UserDataContext.Provider value={userDataStore}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const context = useContext(UserDataContext)
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider')
  }
  return context
}
