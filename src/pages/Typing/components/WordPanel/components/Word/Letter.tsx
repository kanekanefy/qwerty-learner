import { EXPLICIT_SPACE } from '@/constants'
import { dyslexiaConfigAtom, fontSizeConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import React from 'react'

export type LetterState = 'normal' | 'correct' | 'wrong'

export type LetterProps = {
  letter: string
  state?: LetterState
  visible?: boolean
}

const confusableLetters: Record<string, string> = {
  b: 'text-blue-500',
  d: 'text-red-500',
  p: 'text-green-500',
  q: 'text-yellow-500',
}

const Letter: React.FC<LetterProps> = ({ letter, state = 'normal', visible = true }) => {
  const fontSizeConfig = useAtomValue(fontSizeConfigAtom)
  const { isDyslexiaModeEnabled } = useAtomValue(dyslexiaConfigAtom)
  const isExplicitSpace = letter === EXPLICIT_SPACE
  let colorClass =
    state === 'correct' ? 'ql-letter--correct' : state === 'wrong' ? 'ql-letter--wrong' : isExplicitSpace ? 'ql-letter--muted' : ''

  if (isDyslexiaModeEnabled && confusableLetters[letter.toLowerCase()]) {
    colorClass += ` ${confusableLetters[letter.toLowerCase()]}`
  }

  let transformClass = ''
  if (isDyslexiaModeEnabled && state === 'correct') {
    transformClass = 'scale-150'
  }
  return (
    <span
      className={`ql-letter ql-font-word m-0 p-0 font-normal ${colorClass} ${transformClass} pr-0.8`}
      style={{ fontSize: fontSizeConfig.foreignFont.toString() + 'px' }}
    >
      {visible ? letter : '_'}
    </span>
  )
}

export default React.memo(Letter)
