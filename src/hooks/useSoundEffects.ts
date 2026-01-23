import { useCallback, useRef } from 'react'

type SoundType = 'correct' | 'wrong' | 'victory' | 'click' | 'levelUp'

const SOUND_URLS: Record<SoundType, string> = {
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  victory: '/sounds/victory.mp3',
  click: '/sounds/click.mp3',
  levelUp: '/sounds/level-up.mp3'
}

export function useSoundEffects() {
  const audioRefs = useRef<Map<SoundType, HTMLAudioElement>>(new Map())
  const isMuted = useRef(false)

  const getAudio = useCallback((type: SoundType) => {
    if (!audioRefs.current.has(type)) {
      const audio = new Audio(SOUND_URLS[type])
      audio.preload = 'auto'
      audioRefs.current.set(type, audio)
    }
    return audioRefs.current.get(type)!
  }, [])

  const playSound = useCallback((type: SoundType, volume = 0.5) => {
    if (isMuted.current) return

    try {
      const audio = getAudio(type)
      audio.currentTime = 0
      audio.volume = volume
      audio.play().catch(() => {
        // Silently fail if autoplay is blocked
      })
    } catch (error) {
      console.warn(`Failed to play sound: ${type}`, error)
    }
  }, [getAudio])

  const playCorrect = useCallback(() => playSound('correct', 0.6), [playSound])
  const playWrong = useCallback(() => playSound('wrong', 0.5), [playSound])
  const playVictory = useCallback(() => playSound('victory', 0.7), [playSound])
  const playClick = useCallback(() => playSound('click', 0.3), [playSound])
  const playLevelUp = useCallback(() => playSound('levelUp', 0.7), [playSound])

  const toggleMute = useCallback(() => {
    isMuted.current = !isMuted.current
    return isMuted.current
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    isMuted.current = muted
  }, [])

  return {
    playSound,
    playCorrect,
    playWrong,
    playVictory,
    playClick,
    playLevelUp,
    toggleMute,
    setMuted,
    isMuted: () => isMuted.current
  }
}
