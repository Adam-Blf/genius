import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  PanInfo
} from 'framer-motion'
import { useState, useCallback } from 'react'
import type { Fact } from '../data/facts'
import { categories } from '../data/facts'

interface PhysicsSwipeCardProps {
  fact: Fact
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
  onSave?: () => void
}

// Spring physics configuration for realistic movement
const springConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8
}

const throwConfig = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
  mass: 0.5
}

export function PhysicsSwipeCard({ fact, onSwipe, isTop, onSave }: PhysicsSwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const controls = useAnimation()

  // Motion values for physics-based animations
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Transforms based on drag position
  const rotate = useTransform(x, [-300, 0, 300], [-35, 0, 35])
  const rotateY = useTransform(x, [-300, 0, 300], [-15, 0, 15])
  const scale = useTransform(
    x,
    [-300, -150, 0, 150, 300],
    [0.95, 1, 1, 1, 0.95]
  )

  // Background card scale (creates depth effect)
  const bgScale = useTransform(x, [-200, 0, 200], [0.98, 0.95, 0.98])
  const bgY = useTransform(x, [-200, 0, 200], [5, 10, 5])

  // Indicator opacities with smooth transitions
  const likeOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1])
  const nopeOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0])

  // Glow effects
  const rightGlow = useTransform(x, [0, 100, 200], [0, 0.3, 0.6])
  const leftGlow = useTransform(x, [-200, -100, 0], [0.6, 0.3, 0])

  const category = categories[fact.category]

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback(
    async (_: any, info: PanInfo) => {
      setIsDragging(false)

      const velocity = info.velocity.x
      const offset = info.offset.x
      const direction = offset > 0 ? 'right' : 'left'

      // Physics-based threshold: consider both offset and velocity
      const shouldSwipe =
        Math.abs(offset) > 100 || Math.abs(velocity) > 500

      if (shouldSwipe) {
        // Calculate exit position based on velocity for natural feel
        const exitX = direction === 'right'
          ? Math.max(400, offset + velocity * 0.5)
          : Math.min(-400, offset + velocity * 0.5)

        // Animate card flying off with momentum
        await controls.start({
          x: exitX,
          y: info.offset.y + info.velocity.y * 0.3,
          rotate: direction === 'right' ? 30 : -30,
          opacity: 0,
          transition: {
            ...throwConfig,
            opacity: { duration: 0.2 }
          }
        })

        onSwipe(direction)
        if (direction === 'right' && onSave) {
          onSave()
        }
      } else {
        // Snap back with spring physics
        controls.start({
          x: 0,
          y: 0,
          transition: springConfig
        })
      }
    },
    [controls, onSwipe, onSave]
  )

  const handleFlip = useCallback(() => {
    if (!isDragging) {
      setIsFlipped((prev) => !prev)
    }
  }, [isDragging])

  // Background card (shows depth in stack)
  if (!isTop) {
    return (
      <motion.div
        className="absolute w-full h-full"
        style={{ scale: bgScale, y: bgY }}
      >
        <div className="w-full h-full rounded-3xl bg-slate-800/50 border border-slate-700/50 shadow-xl" />
      </motion.div>
    )
  }

  return (
    <motion.div
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
      style={{
        x,
        y,
        rotate,
        scale,
        rotateY,
        transformPerspective: 1200
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileTap={{ scale: 1.02 }}
      onTap={handleFlip}
    >
      {/* Glow effects */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-green-500/30 blur-2xl -z-10"
        style={{ opacity: rightGlow }}
      />
      <motion.div
        className="absolute inset-0 rounded-3xl bg-red-500/30 blur-2xl -z-10"
        style={{ opacity: leftGlow }}
      />

      {/* Card with 3D flip */}
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          perspective: 1200
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Front face */}
        <div
          className={`absolute w-full h-full rounded-3xl bg-gradient-to-br ${category.color} p-1 shadow-2xl overflow-hidden`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full rounded-[22px] bg-slate-900 p-6 flex flex-col">
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{category.emoji}</span>
              <span className="text-sm font-medium text-slate-400">
                {category.name}
              </span>
              <div className="ml-auto text-xs text-slate-500">Tap pour retourner</div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
              <motion.span
                className="text-7xl mb-6"
                animate={{
                  scale: isDragging ? 0.9 : 1,
                  rotate: isDragging ? [0, -5, 5, 0] : 0
                }}
                transition={{ duration: 0.3 }}
              >
                {fact.emoji}
              </motion.span>
              <h2 className="text-2xl font-bold text-white mb-4">{fact.title}</h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                {fact.content}
              </p>
            </div>

            {/* Swipe Hint */}
            <div className="flex justify-center gap-8 mt-4 text-sm text-slate-500">
              <motion.span
                animate={{ x: isDragging ? -10 : 0, opacity: isDragging ? 0.5 : 1 }}
              >
                Swipe Gauche = Suivant
              </motion.span>
              <motion.span
                animate={{ x: isDragging ? 10 : 0, opacity: isDragging ? 0.5 : 1 }}
              >
                Swipe Droite = Sauvegarder
              </motion.span>
            </div>
          </div>

          {/* LIKE indicator */}
          <motion.div
            className="absolute top-8 right-8 bg-green-500 text-white font-bold text-xl px-4 py-2 rounded-xl border-4 border-green-400 rotate-12 shadow-lg"
            style={{ opacity: likeOpacity }}
          >
            SAUVEGARDE !
          </motion.div>

          {/* NOPE indicator */}
          <motion.div
            className="absolute top-8 left-8 bg-red-500 text-white font-bold text-xl px-4 py-2 rounded-xl border-4 border-red-400 -rotate-12 shadow-lg"
            style={{ opacity: nopeOpacity }}
          >
            SUIVANT
          </motion.div>
        </div>

        {/* Back face (bonus info) */}
        <div
          className={`absolute w-full h-full rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-1 shadow-2xl overflow-hidden`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="w-full h-full rounded-[22px] bg-slate-950 p-6 flex flex-col justify-center items-center text-center">
            <span className="text-5xl mb-6">🎓</span>
            <h3 className="text-xl font-bold text-white mb-4">Le savais-tu ?</h3>
            <p className="text-slate-400 leading-relaxed px-4">
              Cette information fait partie de la categorie{' '}
              <span className="text-white font-semibold">{category.name}</span>.
            </p>
            <div className="mt-6 flex items-center gap-2 text-slate-500">
              <span className="text-2xl">{category.emoji}</span>
              <span>Tap pour revenir</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
