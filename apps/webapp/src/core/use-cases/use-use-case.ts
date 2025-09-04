'use client'

import { Container, UseCaseService } from 'core'
import type { Type } from 'core/types/type'
import type { UseCase, UseCaseParams, UseCaseReturn } from 'core/use-cases/use-case'
import type { UseCaseOptions } from 'core/use-cases/use-case-options'
import { useCallback, useEffect, useState } from 'react'
import { webAppContainer } from '@/src/core/di/webapp.container'

/**
 * Execute a single use case.
 */
export async function executeUseCase<T extends UseCase>(
  useCaseClass: Type<T>,
  params?: UseCaseParams<T>,
  options?: {
    defaultParams?: UseCaseParams<T>
    useCaseOptions?: UseCaseOptions
  }
): Promise<UseCaseReturn<T>> {
  const service = webAppContainer.get<UseCaseService>(UseCaseService.ID)

  const finalParams = params ?? options?.defaultParams
  const finalOptions = options?.useCaseOptions ?? { silentError: false }

  return service.execute(useCaseClass, finalParams, finalOptions) as Promise<UseCaseReturn<T>>
}

/**
 * React hook for a single use case.
 */
export interface UseUseCaseOptions<T extends UseCase> {
  defaultParams?: UseCaseParams<T>
  useCaseOptions?: UseCaseOptions
  immediate?: boolean
}

export function useUseCase<T extends UseCase>(
  useCaseClass: Type<T>,
  options: UseUseCaseOptions<T> = {}
): {
  isLoading: boolean
  data: UseCaseReturn<T> | null
  execute: (params?: UseCaseParams<T>, executeOptions?: UseCaseOptions) => Promise<UseCaseReturn<T>>
  reset: () => void
} {
  const [isLoading, setIsLoading] = useState<boolean>(!!options.immediate)
  const [data, setData] = useState<UseCaseReturn<T> | null>(null)

  const execute = useCallback(
    async (
      params?: UseCaseParams<T>,
      executeOptions?: UseCaseOptions
    ): Promise<UseCaseReturn<T>> => {
      setIsLoading(true)
      try {
        const result = await executeUseCase(useCaseClass, params, {
          defaultParams: options.defaultParams,
          useCaseOptions: executeOptions ?? options.useCaseOptions
        })
        setData(result)
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [useCaseClass, options.defaultParams, options.useCaseOptions]
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setData(null)
  }, [])

  // Execute on mount if requested
  // biome-ignore lint/correctness/useExhaustiveDependencies
  useEffect(() => {
    if (options.immediate) {
      execute(options.defaultParams)
    }
  }, [options.immediate])

  return { isLoading, data, execute, reset }
}
