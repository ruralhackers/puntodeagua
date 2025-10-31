'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'

/**
 * Component that automatically refreshes the session if it detects old data structure.
 * Used to update JWT tokens with new fields after migrations (e.g., adding waterLimitRule).
 */
export function SessionRefresher() {
  const { data: session, update, status } = useSession()
  const hasRefreshed = useRef(false)

  useEffect(() => {
    // Only proceed if session is loaded and we haven't refreshed yet
    if (status === 'loading' || hasRefreshed.current) {
      return
    }

    // Check if session has old data structure (missing waterLimitRule in community)
    const needsRefresh = session?.user?.community && !session.user.community.waterLimitRule

    if (needsRefresh) {
      hasRefreshed.current = true
      console.log('SessionRefresher: Detected old session structure, updating...')
      update()
    }
  }, [session, status, update])

  return null // This component doesn't render anything
}
