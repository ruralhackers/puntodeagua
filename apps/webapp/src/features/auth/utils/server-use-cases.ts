import { UseCaseService } from 'core'
import type { Type } from 'core/types/type'
import type { UseCase, UseCaseParams, UseCaseReturn } from 'core/use-cases/use-case'
import type { UseCaseOptions } from 'core/use-cases/use-case-options'
import { webAppContainer } from '@/src/core/di/webapp.container'
import { getServerToken } from './server-auth'

/**
 * Server-side use case execution utilities
 * These functions work only on the server side and automatically inject tokens
 */

/**
 * Execute a use case on the server with automatic token injection
 */
export async function executeServerUseCase<T extends UseCase>(
  useCaseClass: Type<T>,
  params?: UseCaseParams<T>,
  options?: {
    defaultParams?: UseCaseParams<T>
    useCaseOptions?: UseCaseOptions
  }
): Promise<UseCaseReturn<T>> {
  const service = webAppContainer.get<UseCaseService>(UseCaseService.ID)

  // Get token from server cookies
  const token = await getServerToken()

  // Merge token into params if it exists
  const finalParams = {
    ...params,
    ...options?.defaultParams,
    ...(token && { token })
  }

  const finalOptions = options?.useCaseOptions ?? { silentError: false }

  return service.execute(useCaseClass, finalParams, finalOptions) as Promise<UseCaseReturn<T>>
}

/**
 * Get a server-side use case executor with automatic token injection
 */
export function getServerUseCase<T extends UseCase>(
  useCaseClass: Type<T>,
  options?: {
    defaultParams?: UseCaseParams<T>
    useCaseOptions?: UseCaseOptions
  }
): {
  execute: (params?: UseCaseParams<T>, executeOptions?: UseCaseOptions) => Promise<UseCaseReturn<T>>
} {
  return {
    async execute(
      params?: UseCaseParams<T>,
      executeOptions?: UseCaseOptions
    ): Promise<UseCaseReturn<T>> {
      return executeServerUseCase(useCaseClass, params, {
        defaultParams: options?.defaultParams,
        useCaseOptions: executeOptions ?? options?.useCaseOptions
      })
    }
  }
}

/**
 * Check if a use case can be executed on the server (has token)
 */
export async function canExecuteServerUseCase(): Promise<boolean> {
  const token = await getServerToken()
  return !!token
}
