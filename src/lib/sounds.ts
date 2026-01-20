// Sound FX Engine using Web Audio API

type SoundType = 'swipeRight' | 'swipeLeft' | 'levelUp' | 'badge' | 'tap' | 'success' | 'error'

interface SoundConfig {
  frequency: number
  duration: number
  type: OscillatorType
  volume: number
  ramp?: 'up' | 'down'
}

const soundConfigs: Record<SoundType, SoundConfig | SoundConfig[]> = {
  swipeRight: {
    frequency: 880, // A5
    duration: 0.1,
    type: 'sine',
    volume: 0.3,
    ramp: 'up',
  },
  swipeLeft: {
    frequency: 220, // A3
    duration: 0.15,
    type: 'triangle',
    volume: 0.25,
    ramp: 'down',
  },
  levelUp: [
    { frequency: 523.25, duration: 0.1, type: 'sine', volume: 0.3 }, // C5
    { frequency: 659.25, duration: 0.1, type: 'sine', volume: 0.3 }, // E5
    { frequency: 783.99, duration: 0.15, type: 'sine', volume: 0.35 }, // G5
    { frequency: 1046.5, duration: 0.2, type: 'sine', volume: 0.4 }, // C6
  ],
  badge: [
    { frequency: 440, duration: 0.08, type: 'sine', volume: 0.3 },
    { frequency: 554.37, duration: 0.08, type: 'sine', volume: 0.3 },
    { frequency: 659.25, duration: 0.12, type: 'sine', volume: 0.35 },
  ],
  tap: {
    frequency: 600,
    duration: 0.05,
    type: 'sine',
    volume: 0.15,
  },
  success: {
    frequency: 987.77, // B5
    duration: 0.15,
    type: 'sine',
    volume: 0.3,
  },
  error: {
    frequency: 196, // G3
    duration: 0.2,
    type: 'sawtooth',
    volume: 0.2,
    ramp: 'down',
  },
}

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

function playTone(config: SoundConfig, delay = 0): void {
  const ctx = getAudioContext()

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.type = config.type
  oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime + delay)

  // Volume envelope
  const startTime = ctx.currentTime + delay
  const endTime = startTime + config.duration

  if (config.ramp === 'up') {
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(config.volume, startTime + config.duration * 0.3)
    gainNode.gain.linearRampToValueAtTime(0, endTime)
  } else if (config.ramp === 'down') {
    gainNode.gain.setValueAtTime(config.volume, startTime)
    gainNode.gain.linearRampToValueAtTime(0, endTime)
  } else {
    gainNode.gain.setValueAtTime(config.volume, startTime)
    gainNode.gain.linearRampToValueAtTime(0, endTime - 0.02)
  }

  oscillator.start(startTime)
  oscillator.stop(endTime)
}

export function playSound(type: SoundType, enabled = true): void {
  if (!enabled) return

  try {
    const config = soundConfigs[type]

    if (Array.isArray(config)) {
      // Play sequence of notes
      let delay = 0
      config.forEach((noteConfig) => {
        playTone(noteConfig, delay)
        delay += noteConfig.duration
      })
    } else {
      playTone(config)
    }
  } catch {
    // Silently fail if audio is not available
    console.warn('Audio not available')
  }
}

// Create a sound hook
export function useSoundPlayer() {
  const play = (type: SoundType, enabled = true) => {
    playSound(type, enabled)
  }

  return { play }
}
