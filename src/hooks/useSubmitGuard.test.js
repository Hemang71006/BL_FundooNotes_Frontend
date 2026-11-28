import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSubmitGuard } from './useSubmitGuard'

describe('useSubmitGuard', () => {
  it('blocks duplicate submissions until the current request ends', () => {
    const { result } = renderHook(() => useSubmitGuard())

    const first = result.current.begin()
    expect(first).not.toBeNull()
    expect(result.current.begin()).toBeNull()

    result.current.end(first)
    const second = result.current.begin()
    expect(second).not.toBe(first)
  })

  it('ignores completion of a superseded request', () => {
    const { result } = renderHook(() => useSubmitGuard())

    const first = result.current.begin()
    result.current.end(first)
    const second = result.current.begin()

    result.current.end(first)
    expect(result.current.begin()).toBeNull()

    result.current.end(second)
    expect(result.current.begin()).not.toBeNull()
  })
})
