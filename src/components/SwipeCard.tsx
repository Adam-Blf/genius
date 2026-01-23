import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useState } from 'react'
import type { Fact } from '../data/facts'
import { categories } from '../data/facts'

interface SwipeCardProps {
  fact: Fact
  onSwipe: (direction: 'left' | 'right') => void
  isTop: boolean
}

export function SwipeCard({ fact, onSwipe, isTop }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  // Indicators opacity
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const category = categories[fact.category]

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(300)
      onSwipe('right')
    } else if (info.offset.x < -100) {
      setExitX(-300)
      onSwipe('left')
    }
  }

  if (!isTop) {
    return (
      <motion.div
        className="absolute w-full h-full"
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 0.95, y: 10 }}
      >
        <div className="w-full h-full rounded-3xl bg-slate-800/50 border border-slate-700/50" />
      </motion.div>
    )
  }

  return (
    <motion.div
      className="absolute w-full h-full cursor-grab active:cursor-grabbing touch-none"
      style={{ x, rotate, opacity }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: 1, y: 0 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.2 } }}
      whileTap={{ scale: 1.02 }}
    >
      {/* Card */}
      <div className={`relative w-full h-full rounded-3xl bg-gradient-to-br ${category.color} p-1 shadow-2xl overflow-hidden`}>
        <div className="w-full h-full rounded-[22px] bg-slate-900 p-6 flex flex-col">

          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{category.emoji}</span>
            <span className="text-sm font-medium text-slate-400">{category.name}</span>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
            <span className="text-6xl mb-6">{fact.emoji}</span>
            <h2 className="text-2xl font-bold text-white mb-4">{fact.title}</h2>
            <p className="text-lg text-slate-300 leading-relaxed">{fact.content}</p>
          </div>

          {/* Swipe Hint */}
          <div className="flex justify-center gap-8 mt-4 text-sm text-slate-500">
            <span>← Suivant</span>
            <span>Sauvegarder →</span>
          </div>
        </div>

        {/* LIKE indicator */}
        <motion.div
          className="absolute top-8 right-8 bg-green-500 text-white font-bold text-2xl px-4 py-2 rounded-xl border-4 border-green-400 rotate-12"
          style={{ opacity: likeOpacity }}
        >
          GARDÉ ✓
        </motion.div>

        {/* NOPE indicator */}
        <motion.div
          className="absolute top-8 left-8 bg-red-500 text-white font-bold text-2xl px-4 py-2 rounded-xl border-4 border-red-400 -rotate-12"
          style={{ opacity: nopeOpacity }}
        >
          SUIVANT
        </motion.div>
      </div>
    </motion.div>
  )
}
