import { UseCaseService } from 'core'
import type { Type } from 'core/types/type'
import type { UseCase, UseCaseParams, UseCaseReturn } from 'core/use-cases/use-case'
import type { UseCaseOptions } from 'core/use-cases/use-case-options'
import { webAppContainer } from '@/src/core/di/webapp.container'

/**
 * Options for a single use case.
 */
export interface GetUseCaseOptions<T extends UseCase> {
  defaultParams?: UseCaseParams<T>
  useCaseOptions?: UseCaseOptions
}

/**
 * Server-compatible single use case executor.
 *
 * @example
 * const getUser = getUseCase(GetUserQuery, container)
 * const result = await getUser.execute({ id: '123' })
 */
export function getUseCase<T extends UseCase>(
  useCaseClass: Type<T>,
  options: GetUseCaseOptions<T> = {}
): {
  execute: (params?: UseCaseParams<T>, executeOptions?: UseCaseOptions) => Promise<UseCaseReturn<T>>
} {
  return {
    async execute(
      params?: UseCaseParams<T>,
      executeOptions?: UseCaseOptions
    ): Promise<UseCaseReturn<T>> {
      const service = webAppContainer.get<InstanceType<typeof UseCaseService>>(UseCaseService.ID)

      const finalParams = params ?? options.defaultParams
      const finalOptions = executeOptions ?? options.useCaseOptions ?? { silentError: false }

      return service.execute(useCaseClass, finalParams, finalOptions) as Promise<UseCaseReturn<T>>
    }
  }
}
