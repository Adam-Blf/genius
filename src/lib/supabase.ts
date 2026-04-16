import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = url && key
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const hasAuth = !!supabase

export interface PublicCard {
  id: string
  author_id: string
  uid: string
  question: string
  answer: string
  choices?: string[] | null
  category: string
  chapter_id?: string | null
  created_at: string
}
