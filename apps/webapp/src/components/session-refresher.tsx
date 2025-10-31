'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'

/**
 * Component that automatically refreshes the session once if needed.
 * Used to update JWT tokens with new data structure after migrations.
 */
export function SessionRefresher() {
  const { update } = useSession()
  const hasRefreshed = useRef(false)

  useEffect(() => {
    // Only refresh once per mount
    if (!hasRefreshed.current) {
      hasRefreshed.current = true
      console.log('SessionRefresher: Updating session to get fresh data')
      update()
    }
  }, [update])

  return null // This component doesn't render anything
}
