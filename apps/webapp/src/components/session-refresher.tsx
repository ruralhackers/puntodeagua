'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Component that automatically refreshes the layout once if needed.
 * Used to update session with new data structure after migrations.
 */
export function SessionRefresher() {
  const router = useRouter()
  const hasRefreshed = useRef(false)

  useEffect(() => {
    // Only refresh once per mount
    if (!hasRefreshed.current) {
      hasRefreshed.current = true
      console.log('SessionRefresher: Refreshing layout to get fresh session data')
      router.refresh()
    }
  }, [router])

  return null // This component doesn't render anything
}
