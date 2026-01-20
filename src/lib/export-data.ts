// Export user data as JSON file

export interface ExportData {
  version: string
  exportedAt: string
  preferences: {
    name: string
    selectedCategories: string[]
    dailyGoal: number
  }
  stats: {
    totalXp: number
    currentStreak: number
    longestStreak: number
  }
  progress: {
    learnedCards: string[]
    knownCards: string[]
    reviewQueue: string[]
  }
}

export function exportUserData(state: {
  preferences: {
    name: string
    selectedCategories: string[]
    dailyGoal: number
  }
  stats: {
    totalXp: number
    currentStreak: number
    longestStreak: number
  }
  learnedCards: string[]
  knownCards: string[]
  reviewQueue: string[]
}): ExportData {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    preferences: {
      name: state.preferences.name,
      selectedCategories: state.preferences.selectedCategories,
      dailyGoal: state.preferences.dailyGoal,
    },
    stats: {
      totalXp: state.stats.totalXp,
      currentStreak: state.stats.currentStreak,
      longestStreak: state.stats.longestStreak,
    },
    progress: {
      learnedCards: state.learnedCards,
      knownCards: state.knownCards,
      reviewQueue: state.reviewQueue,
    },
  }
}

export function downloadJSON(data: ExportData, filename = 'swipy-export.json'): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
