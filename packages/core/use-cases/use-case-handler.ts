import type { UseCase, UseCaseParams, UseCaseReturn } from './use-case'
import type { UseCaseOptions } from './use-case-options'
import type { Middleware } from './middleware/middleware.ts'

export class UseCaseHandler implements UseCase {
  private constructor(
    readonly useCase: UseCase,
    private readonly middleware: Middleware,
    private readonly options: UseCaseOptions
  ) {}

  handle<T extends UseCase>(params: UseCaseParams<T>): Promise<UseCaseReturn<T>> {
    return this.middleware.intercept(params, this.useCase, this.options) as Promise<
      UseCaseReturn<T>
    >
  }

  static create({
    middleware,
    options,
    next
  }: {
    next: UseCase
    middleware: Middleware
    options: UseCaseOptions
  }) {
    return new UseCaseHandler(next, middleware, options)
  }
}
