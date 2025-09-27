import { TypingContext } from '../../store'
import { dyslexiaConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useContext, useEffect, useMemo, useState } from 'react'

export default function Progress({ className }: { className?: string }) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!
  const { isDyslexiaModeEnabled } = useAtomValue(dyslexiaConfigAtom)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(0)
  const [milestones, setMilestones] = useState<number[]>([])

  const colorSwitcher: { [key: number]: string } = {
    0: 'bg-indigo-200 dark:bg-indigo-300',
    1: 'bg-indigo-300 dark:bg-indigo-400',
    2: 'bg-indigo-400 dark:bg-indigo-500',
  }

  useEffect(() => {
    const newProgress = Math.floor((state.chapterData.index / state.chapterData.words.length) * 100)
    setProgress(newProgress)
    const colorPhase = Math.floor(newProgress / 33.4)
    setPhase(colorPhase)

    if (isDyslexiaModeEnabled) {
      const newMilestones = [25, 50, 75, 100].filter((m) => newProgress >= m)
      if (newMilestones.length > milestones.length) {
        // a new milestone has been reached
        // play an animation or show a message
      }
      setMilestones(newMilestones)
    }
  }, [state.chapterData.index, state.chapterData.words.length, isDyslexiaModeEnabled, milestones.length])

  const milestoneColorClass = useMemo(() => {
    if (!isDyslexiaModeEnabled) {
      return ''
    }
    if (milestones.includes(100)) {
      return 'bg-green-500'
    }
    if (milestones.includes(75)) {
      return 'bg-yellow-500'
    }
    if (milestones.includes(50)) {
      return 'bg-orange-500'
    }
    if (milestones.includes(25)) {
      return 'bg-red-500'
    }
    return ''
  }, [isDyslexiaModeEnabled, milestones])

  return (
    <div className={`relative w-1/4 pt-1 ${className}`}>
      <div className="mb-4 flex h-2 overflow-hidden rounded-xl bg-indigo-100 text-xs transition-all duration-300 dark:bg-indigo-200">
        <div
          style={{ width: `${progress}%` }}
          className={`flex flex-col justify-center whitespace-nowrap rounded-xl text-center text-white shadow-none transition-all duration-300 ${
            milestoneColorClass || (colorSwitcher[phase] ?? 'bg-indigo-200 dark:bg-indigo-300')
          }`}
        ></div>
      </div>
    </div>
  )
}
