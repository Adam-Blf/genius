import { useCallback, useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import {
  getStoredHeartsData,
  calculateRegeneratedHearts,
  getTimeUntilNextHeart,
  saveHeartsData,
  formatTimeRemaining
} from '../services/heartService'

// Local profile management (no auth needed)
function useLocalProfile() {
  const getProfile = () => {
    const stored = localStorage.getItem('genius_profile')
    return stored ? JSON.parse(stored) : { hearts: 5, xp_total: 0, current_streak: 0 }
  }

  const updateProfile = (updates: Record<string, unknown>) => {
    const current = getProfile()
    const updated = { ...current, ...updates }
    localStorage.setItem('genius_profile', JSON.stringify(updated))
  }

  return { profile: getProfile(), updateProfile }
}

export function useGameEngine() {
  const { profile, updateProfile } = useLocalProfile()
  const game = useGame()

  const [heartsData, setHeartsData] = useState(getStoredHeartsData())
  const [timeUntilNextHeart, setTimeUntilNextHeart] = useState<string | null>(null)

  // Regenerate hearts on mount and periodically
  useEffect(() => {
    const updateHearts = () => {
      const data = getStoredHeartsData()
      const regeneratedHearts = calculateRegeneratedHearts(data)

      if (regeneratedHearts !== data.hearts) {
        const newData = { ...data, hearts: regeneratedHearts }
        saveHeartsData(newData)
        setHeartsData(newData)

        // Update profile if logged in
        if (profile) {
          updateProfile({ hearts: regeneratedHearts })
        }
      }

      // Update countdown
      const timeRemaining = getTimeUntilNextHeart(data)
      setTimeUntilNextHeart(timeRemaining ? formatTimeRemaining(timeRemaining) : null)
    }

    updateHearts()
    const interval = setInterval(updateHearts, 1000)

    return () => clearInterval(interval)
  }, [profile, updateProfile])

  const useHeart = useCallback(() => {
    const newHearts = Math.max(0, heartsData.hearts - 1)
    const newData = {
      ...heartsData,
      hearts: newHearts,
      lastLostAt: Date.now()
    }
    saveHeartsData(newData)
    setHeartsData(newData)

    if (profile) {
      updateProfile({ hearts: newHearts })
    }

    return newHearts
  }, [heartsData, profile, updateProfile])

  const refillHearts = useCallback(() => {
    const newData = {
      ...heartsData,
      hearts: 5,
      lastLostAt: null
    }
    saveHeartsData(newData)
    setHeartsData(newData)

    if (profile) {
      updateProfile({ hearts: 5 })
    }
  }, [heartsData, profile, updateProfile])

  return {
    ...game,
    hearts: heartsData.hearts,
    maxHearts: 5,
    isPremium: heartsData.isPremium,
    timeUntilNextHeart,
    useHeart,
    refillHearts
  }
}
