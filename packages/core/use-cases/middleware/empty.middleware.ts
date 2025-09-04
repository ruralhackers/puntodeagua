import type { UseCase } from '../use-case'
import type { UseCaseOptions } from '../use-case-options'
import type { Middleware } from './middleware'

export class EmptyMiddleware implements Middleware {
  static readonly ID = 'EmptyMiddleware'

  intercept(params: unknown, next: UseCase, options: UseCaseOptions): Promise<unknown> {
    return next.handle(params)
  }
}
