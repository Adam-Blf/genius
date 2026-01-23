const HEART_REGEN_TIME = 30 * 60 * 1000 // 30 minutes in milliseconds
const MAX_HEARTS = 5
const STORAGE_KEY = 'genius_hearts_data'

interface HeartsData {
  hearts: number
  lastLostAt: number | null
  isPremium: boolean
}

export function getStoredHeartsData(): HeartsData {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return {
    hearts: MAX_HEARTS,
    lastLostAt: null,
    isPremium: false
  }
}

export function saveHeartsData(data: HeartsData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function calculateRegeneratedHearts(data: HeartsData): number {
  if (data.isPremium) return MAX_HEARTS
  if (!data.lastLostAt || data.hearts >= MAX_HEARTS) return data.hearts

  const timeSinceLoss = Date.now() - data.lastLostAt
  const heartsToRegen = Math.floor(timeSinceLoss / HEART_REGEN_TIME)

  return Math.min(MAX_HEARTS, data.hearts + heartsToRegen)
}

export function getTimeUntilNextHeart(data: HeartsData): number | null {
  if (data.isPremium || data.hearts >= MAX_HEARTS || !data.lastLostAt) {
    return null
  }

  const timeSinceLoss = Date.now() - data.lastLostAt
  const timeInCurrentCycle = timeSinceLoss % HEART_REGEN_TIME

  return HEART_REGEN_TIME - timeInCurrentCycle
}

export function useHeart(currentHearts: number): { newHearts: number; lastLostAt: number } {
  const newHearts = Math.max(0, currentHearts - 1)
  const lastLostAt = Date.now()

  saveHeartsData({
    hearts: newHearts,
    lastLostAt,
    isPremium: false
  })

  return { newHearts, lastLostAt }
}

export function refillHearts(): void {
  saveHeartsData({
    hearts: MAX_HEARTS,
    lastLostAt: null,
    isPremium: false
  })
}

export function setPremiumStatus(isPremium: boolean): void {
  const data = getStoredHeartsData()
  saveHeartsData({
    ...data,
    isPremium,
    hearts: isPremium ? MAX_HEARTS : data.hearts
  })
}

export function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
