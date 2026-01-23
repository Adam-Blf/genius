import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

type RalphMood = 'idle' | 'happy' | 'sad' | 'thinking' | 'celebrating' | 'sleeping'
type RalphSize = 'sm' | 'md' | 'lg' | 'xl'

interface RalphMascotProps {
  mood?: RalphMood
  size?: RalphSize
  className?: string
  showSpeechBubble?: boolean
  speechText?: string
}

const sizeStyles: Record<RalphSize, { width: number; height: number }> = {
  sm: { width: 60, height: 60 },
  md: { width: 100, height: 100 },
  lg: { width: 150, height: 150 },
  xl: { width: 200, height: 200 }
}

function getMoodAnimation(mood: RalphMood) {
  switch (mood) {
    case 'idle':
      return { y: [0, -8, 0] }
    case 'happy':
      return { y: [0, -15, 0], rotate: [0, -5, 5, -5, 0], scale: [1, 1.05, 1] }
    case 'sad':
      return { y: [0, 5, 0], rotate: [0, -2, 2, 0] }
    case 'thinking':
      return { rotate: [0, 8, 0, -8, 0] }
    case 'celebrating':
      return { y: [0, -25, 0], rotate: [0, -10, 10, -10, 0], scale: [1, 1.15, 1] }
    case 'sleeping':
      return { y: [0, 3, 0], scale: [1, 0.98, 1] }
    default:
      return {}
  }
}

function getMoodTransition(mood: RalphMood) {
  switch (mood) {
    case 'idle':
      return { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }
    case 'happy':
      return { duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }
    case 'sad':
      return { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }
    case 'thinking':
      return { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }
    case 'celebrating':
      return { duration: 0.6, repeat: 5 }
    case 'sleeping':
      return { duration: 3, repeat: Infinity, ease: 'easeInOut' as const }
    default:
      return {}
  }
}

// Get filter/effects based on mood
function getMoodEffects(mood: RalphMood): string {
  switch (mood) {
    case 'celebrating':
      return 'drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]'
    case 'happy':
      return 'drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]'
    case 'sad':
      return 'grayscale-[20%] brightness-90'
    case 'sleeping':
      return 'brightness-75'
    default:
      return ''
  }
}

export function RalphMascot({
  mood = 'idle',
  size = 'md',
  className,
  showSpeechBubble = false,
  speechText
}: RalphMascotProps) {
  const dimensions = sizeStyles[size]
  const effects = getMoodEffects(mood)

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      {/* Speech Bubble */}
      {showSpeechBubble && speechText && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap shadow-lg z-10"
        >
          {speechText}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white rotate-45" />
        </motion.div>
      )}

      {/* Ralph Image with Animations */}
      <motion.div
        animate={getMoodAnimation(mood)}
        transition={getMoodTransition(mood)}
        style={{ width: dimensions.width, height: dimensions.height }}
        className="relative"
      >
        <motion.img
          src="/ralph.png"
          alt="Ralph the Mascot"
          className={cn(
            'w-full h-full object-contain',
            effects
          )}
          draggable={false}
        />

        {/* Thinking bubbles */}
        {mood === 'thinking' && (
          <motion.div
            className="absolute -right-2 -top-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-2 h-2 bg-white rounded-full absolute right-0 top-4"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="w-3 h-3 bg-white rounded-full absolute right-3 top-1"
              animate={{ opacity: [0.6, 1, 0.6], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-4 h-4 bg-white rounded-full absolute right-7 -top-2"
              animate={{ opacity: [0.7, 1, 0.7], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
          </motion.div>
        )}

        {/* Z's for sleeping */}
        {mood === 'sleeping' && (
          <motion.div
            className="absolute -right-4 -top-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.span
              className="absolute text-white font-bold text-lg"
              style={{ right: 0, top: 20 }}
              animate={{ y: [-5, -15], opacity: [1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Z
            </motion.span>
            <motion.span
              className="absolute text-white font-bold text-sm"
              style={{ right: -10, top: 8 }}
              animate={{ y: [-5, -15], opacity: [1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              z
            </motion.span>
            <motion.span
              className="absolute text-white font-bold text-xs"
              style={{ right: -18, top: 0 }}
              animate={{ y: [-5, -15], opacity: [1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            >
              z
            </motion.span>
          </motion.div>
        )}

        {/* Hearts for happy */}
        {mood === 'happy' && (
          <motion.div className="absolute inset-0 pointer-events-none overflow-visible">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute text-red-500"
                style={{
                  left: `${30 + i * 20}%`,
                  top: '-10%',
                  fontSize: '12px'
                }}
                initial={{ y: 0, opacity: 0, scale: 0 }}
                animate={{
                  y: [-10, -30],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  repeatDelay: 1
                }}
              >
                &hearts;
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Confetti for celebrating */}
        {mood === 'celebrating' && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 100}%`,
                  top: '50%',
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][i % 7]
                }}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{
                  y: [0, -80 - Math.random() * 50],
                  x: [(Math.random() - 0.5) * 80],
                  rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                  opacity: [1, 1, 0],
                  scale: [1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.08,
                  ease: 'easeOut'
                }}
              />
            ))}
          </div>
        )}

        {/* Tears for sad */}
        {mood === 'sad' && (
          <>
            <motion.div
              className="absolute w-1.5 h-3 bg-blue-400 rounded-full"
              style={{ left: '30%', top: '40%' }}
              animate={{ y: [0, 20], opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.5 }}
            />
            <motion.div
              className="absolute w-1.5 h-3 bg-blue-400 rounded-full"
              style={{ right: '30%', top: '40%' }}
              animate={{ y: [0, 20], opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.7 }}
            />
          </>
        )}
      </motion.div>
    </div>
  )
}
