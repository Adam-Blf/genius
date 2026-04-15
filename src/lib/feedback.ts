// Web Audio · tiny tones for correct/wrong/levelup, no external files
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as Window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    } catch {
      return null
    }
  }
  return ctx
}

function beep(freq: number, duration = 0.12, volume = 0.08, type: OscillatorType = 'sine', delay = 0) {
  const c = getCtx()
  if (!c) return
  if (!isSoundOn()) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, c.currentTime + delay)
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delay + duration)
  osc.connect(gain).connect(c.destination)
  osc.start(c.currentTime + delay)
  osc.stop(c.currentTime + delay + duration)
}

export function playCorrect() {
  beep(880, 0.1, 0.06, 'sine')
  beep(1320, 0.14, 0.06, 'sine', 0.1)
}

export function playWrong() {
  beep(200, 0.18, 0.08, 'square')
}

export function playLevelUp() {
  beep(523, 0.1, 0.06)
  beep(659, 0.1, 0.06, 'sine', 0.1)
  beep(784, 0.16, 0.06, 'sine', 0.2)
}

export function haptic(pattern: number | number[] = 10) {
  if (!isHapticOn()) return
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export function feedbackCorrect() { playCorrect(); haptic(20) }
export function feedbackWrong() { playWrong(); haptic([10, 60, 10]) }
export function feedbackLevelUp() { playLevelUp(); haptic([40, 40, 80]) }

export function isSoundOn() {
  if (typeof localStorage === 'undefined') return true
  return localStorage.getItem('genius-sound') !== 'off'
}
export function setSound(on: boolean) {
  localStorage.setItem('genius-sound', on ? 'on' : 'off')
}
export function isHapticOn() {
  if (typeof localStorage === 'undefined') return true
  return localStorage.getItem('genius-haptic') !== 'off'
}
export function setHaptic(on: boolean) {
  localStorage.setItem('genius-haptic', on ? 'on' : 'off')
}
