'use client'

import type { Type } from 'core/types/type'
import type { UseCase, UseCaseParams, UseCaseReturn } from 'core/use-cases/use-case'
import type { UseCaseOptions } from 'core/use-cases/use-case-options'
import { useCallback, useEffect, useState } from 'react'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { hybridAuth } from '../utils/hybrid-storage'
import { executeServerUseCase } from '../utils/server-use-cases'

/**
 * Hybrid use case hook that works on both server and client
 * On client: uses the regular useUseCase hook
 * On server: uses server-side execution with automatic token injection
 */
export function useHybridUseCase<T extends UseCase>(
  useCaseClass: Type<T>,
  options: {
    immediate?: boolean
    defaultParams?: UseCaseParams<T>
    useCaseOptions?: UseCaseOptions
  } = {}
) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [serverData, setServerData] = useState<UseCaseReturn<T> | null>(null)
  const [serverLoading, setServerLoading] = useState(false)

  // Client-side use case hook
  const clientUseCase = useUseCase(useCaseClass, options)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Server-side execution function
  const executeServer = useCallback(
    async (params?: UseCaseParams<T>, executeOptions?: UseCaseOptions) => {
      setServerLoading(true)
      try {
        const result = await executeServerUseCase(useCaseClass, params, {
          defaultParams: options.defaultParams,
          useCaseOptions: executeOptions ?? options.useCaseOptions
        })
        setServerData(result)
        return result
      } finally {
        setServerLoading(false)
      }
    },
    [useCaseClass, options.defaultParams, options.useCaseOptions]
  )

  // During SSR or before hydration, provide server-side interface
  if (!isHydrated) {
    return {
      isLoading: serverLoading,
      data: serverData,
      execute: executeServer,
      reset: () => {
        setServerData(null)
        setServerLoading(false)
      }
    }
  }

  // After hydration, use the client use case
  return clientUseCase
}

/**
 * Execute a use case on the server with automatic token injection
 * This function works only on the server side
 */
export async function executeHybridUseCase<T extends UseCase>(
  useCaseClass: Type<T>,
  params?: UseCaseParams<T>,
  options?: {
    defaultParams?: UseCaseParams<T>
    useCaseOptions?: UseCaseOptions
  }
): Promise<UseCaseReturn<T>> {
  // Get token from hybrid storage
  const token = hybridAuth.getToken()

  // Merge token into params if it exists
  const finalParams = {
    ...params,
    ...options?.defaultParams,
    ...(token && { token })
  }

  return executeServerUseCase(useCaseClass, finalParams, options)
}
