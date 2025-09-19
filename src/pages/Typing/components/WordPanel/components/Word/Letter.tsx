import { EXPLICIT_SPACE } from '@/constants'
import { fontSizeConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import React from 'react'

export type LetterState = 'normal' | 'correct' | 'wrong'

export type LetterProps = {
  letter: string
  state?: LetterState
  visible?: boolean
}

const Letter: React.FC<LetterProps> = ({ letter, state = 'normal', visible = true }) => {
  const fontSizeConfig = useAtomValue(fontSizeConfigAtom)
  const isExplicitSpace = letter === EXPLICIT_SPACE
  const colorClass =
    state === 'correct' ? 'ql-letter--correct' : state === 'wrong' ? 'ql-letter--wrong' : isExplicitSpace ? 'ql-letter--muted' : ''
  return (
    <span
      className={`ql-letter ql-font-word m-0 p-0 font-normal ${colorClass} pr-0.8`}
      style={{ fontSize: fontSizeConfig.foreignFont.toString() + 'px' }}
    >
      {visible ? letter : '_'}
    </span>
  )
}

export default React.memo(Letter)
