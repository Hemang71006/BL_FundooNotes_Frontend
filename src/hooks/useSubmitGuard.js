import { useEffect, useRef } from 'react'

/*
 * Project: Fundoo Notes Frontend
 * Module: Submit Guard Hook
 * Author: Hemang
 * Date: 28-11-2026
 * Description: Prevents duplicate submissions and ignores responses from superseded requests.
 */

export function useSubmitGuard() {
  const inFlight = useRef(false)
  const requestId = useRef(0)

  useEffect(() => () => {
    requestId.current += 1
    inFlight.current = false
  }, [])

  const begin = () => {
    if (inFlight.current) {
      return null
    }
    inFlight.current = true
    requestId.current += 1
    return requestId.current
  }

  const isCurrent = (id) => id === requestId.current

  const end = (id) => {
    if (id === requestId.current) {
      inFlight.current = false
    }
  }

  return { begin, isCurrent, end }
}
