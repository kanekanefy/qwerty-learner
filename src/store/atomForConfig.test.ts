import { dyslexiaConfigAtom } from './index'
import { renderHook } from '@testing-library/react'
import { useAtom } from 'jotai'

describe('dyslexiaConfigAtom', () => {
  it('should have the correct default value', () => {
    const { result } = renderHook(() => useAtom(dyslexiaConfigAtom))
    const [config] = result.current

    expect(config.isDyslexiaModeEnabled).toBe(false)
    expect(config.ttsService).toBe('browser')
  })
})
