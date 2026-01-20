// Simplified SM-2 Spaced Repetition Algorithm
// Based on the SuperMemo SM-2 algorithm

export interface ReviewCard {
  questionId: string
  easeFactor: number // 1.3 to 2.5, default 2.5
  interval: number // days until next review
  repetitions: number // number of successful reviews
  nextReviewDate: string // ISO date string
  lastReviewDate: string | null
}

// Quality ratings for SM-2
export type Quality = 0 | 1 | 2 | 3 | 4 | 5
// 0 - Complete blackout
// 1 - Wrong, but recognized answer
// 2 - Wrong, correct answer easy to recall
// 3 - Correct with serious difficulty
// 4 - Correct with some hesitation
// 5 - Perfect response

// Create a new review card
export function createReviewCard(questionId: string): ReviewCard {
  return {
    questionId,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: new Date().toISOString().split('T')[0],
    lastReviewDate: null,
  }
}

// Calculate next review based on quality
export function calculateNextReview(card: ReviewCard, quality: Quality): ReviewCard {
  const now = new Date().toISOString().split('T')[0]

  // If quality < 3, reset repetitions (failed review)
  if (quality < 3) {
    return {
      ...card,
      repetitions: 0,
      interval: 1,
      lastReviewDate: now,
      nextReviewDate: addDays(now, 1),
    }
  }

  // Calculate new ease factor
  let newEaseFactor =
    card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  // Ease factor minimum is 1.3
  newEaseFactor = Math.max(1.3, newEaseFactor)

  // Calculate new interval
  let newInterval: number
  if (card.repetitions === 0) {
    newInterval = 1
  } else if (card.repetitions === 1) {
    newInterval = 6
  } else {
    newInterval = Math.round(card.interval * newEaseFactor)
  }

  return {
    ...card,
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: card.repetitions + 1,
    lastReviewDate: now,
    nextReviewDate: addDays(now, newInterval),
  }
}

// Helper to add days to a date string
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

// Check if a card is due for review
export function isDueForReview(card: ReviewCard): boolean {
  const today = new Date().toISOString().split('T')[0]
  return card.nextReviewDate <= today
}

// Get cards due for review sorted by priority
export function getCardsDueForReview(cards: ReviewCard[]): ReviewCard[] {
  const today = new Date().toISOString().split('T')[0]

  return cards
    .filter((card) => card.nextReviewDate <= today)
    .sort((a, b) => {
      // Sort by how overdue they are (most overdue first)
      if (a.nextReviewDate !== b.nextReviewDate) {
        return a.nextReviewDate.localeCompare(b.nextReviewDate)
      }
      // Then by ease factor (hardest first)
      return a.easeFactor - b.easeFactor
    })
}

// Map swipe actions to quality ratings
// Swipe Right (Known) = Good recall
// Swipe Left (Learn) = Poor recall
export function swipeToQuality(direction: 'left' | 'right', wasFlipped: boolean): Quality {
  if (direction === 'right') {
    // User knew the answer
    return wasFlipped ? 4 : 5 // 4 if they checked, 5 if confident
  } else {
    // User didn't know
    return wasFlipped ? 2 : 1 // 2 if they saw answer, 1 if gave up
  }
}

// Calculate retention percentage
export function calculateRetention(cards: ReviewCard[]): number {
  if (cards.length === 0) return 0

  const successfulCards = cards.filter((card) => card.repetitions > 0)
  return Math.round((successfulCards.length / cards.length) * 100)
}

// Calculate accuracy rate based on history
export function calculateAccuracy(
  totalRight: number,
  totalLeft: number
): number {
  const total = totalRight + totalLeft
  if (total === 0) return 0
  return Math.round((totalRight / total) * 100)
}
