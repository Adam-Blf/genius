import { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  profile?: Profile
}

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  xp_total: number
  current_streak: number
  longest_streak: number
  hearts: number
  last_activity_date: string | null
  is_premium: boolean
  created_at: string
}

export interface AuthState {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
}
