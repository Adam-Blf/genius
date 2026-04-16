import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, loading, signInWithGoogle, available } = useAuth()

  useEffect(() => {
    if (user) navigate('/profile')
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col">
      <button onClick={() => navigate(-1)} className="absolute left-5 top-5 flex items-center gap-2 text-white/60 z-10">
        <ArrowLeft className="w-5 h-5" /><span className="text-sm">Retour</span>
      </button>

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-elephant-500/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="text-7xl mb-6">🐘</div>
        <h1 className="font-display text-5xl text-center leading-none">
          Rejoins <span className="italic text-elephant-300">Genius</span>.
        </h1>
        <p className="text-white/60 text-center text-sm mt-4 max-w-sm">
          Sauvegarde ta progression, publie des cartes et suis d'autres createurs.
        </p>

        <div className="mt-10 w-full max-w-sm">
          {available ? (
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full bg-white text-ink font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/90 active:scale-[0.98] transition disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </button>
          ) : (
            <div className="bg-surface border border-line rounded-2xl p-5 text-center">
              <div className="text-sm font-semibold">Auth non configuree</div>
              <div className="text-xs text-white/50 mt-1">
                Variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` requises.
              </div>
            </div>
          )}

          <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mt-6">
            Mode local fonctionne sans compte · toi seul decides de te connecter
          </p>
        </div>
      </main>
    </div>
  )
}
