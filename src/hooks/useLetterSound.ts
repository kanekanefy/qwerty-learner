import { dyslexiaConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useRef } from 'react'

export default function useLetterSound() {
  const { isReadOutTypedLettersEnabled } = useAtomValue(dyslexiaConfigAtom)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null) // Ref to store the timeout ID

  const playLetterSound = (letter: string) => {
    if (isReadOutTypedLettersEnabled) {
      // Clear any previous timeout to prevent multiple rapid speaks
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Cancel any ongoing speech before speaking a new letter
      speechSynthesis.cancel()

      timeoutRef.current = setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(letter)
        const voices = speechSynthesis.getVoices()
        const englishVoice = voices.find((voice) => voice.lang === 'en-US' || voice.lang === 'en-GB')
        if (englishVoice) {
          utterance.voice = englishVoice
        }
        utterance.pitch = 1
        utterance.rate = 1
        utterance.volume = 1

        speechSynthesis.speak(utterance)
      }, 100) // Increased delay to 100ms
    }
  }

  return playLetterSound
}
