export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
