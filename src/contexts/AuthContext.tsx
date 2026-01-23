import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Profile, AuthContextType } from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
      throw err
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out')
      throw err
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')

    try {
      setError(null)
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, ...updates } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      error,
      signInWithGoogle,
      signOut,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
