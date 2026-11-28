import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

window.confirm = vi.fn(() => true)

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  vi.clearAllMocks()
})
