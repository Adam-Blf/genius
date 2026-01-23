import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { RalphMascot } from '../components/ralph/RalphMascot'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, loading, signInWithGoogle } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-genius-bg">
        <RalphMascot mood="thinking" size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-genius-bg">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 to-transparent pointer-events-none" />

      {/* Logo & Ralph */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center"
      >
        <RalphMascot mood="happy" size="xl" />

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-gradient mt-6"
        >
          Genius
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mt-2 text-center"
        >
          Apprends la culture générale<br />en t'amusant !
        </motion.p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 space-y-3 w-full max-w-xs"
      >
        {[
          { emoji: '🎮', text: 'Quiz interactifs et ludiques' },
          { emoji: '🔥', text: 'Garde ta série en feu' },
          { emoji: '🏆', text: 'Grimpe dans les ligues' }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
          >
            <span className="text-2xl">{feature.emoji}</span>
            <span className="text-gray-300">{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Login button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-10 w-full max-w-xs"
      >
        <Button
          onClick={handleGoogleSignIn}
          variant="primary"
          size="lg"
          className="w-full"
          leftIcon={
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
        >
          Continuer avec Google
        </Button>

        <p className="text-center text-xs text-gray-500 mt-4">
          En continuant, tu acceptes nos conditions d'utilisation
        </p>
      </motion.div>
    </div>
  )
}
