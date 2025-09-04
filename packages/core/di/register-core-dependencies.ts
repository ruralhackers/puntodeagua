import { ConsoleLogger } from '../logger/console-logger'
import { Container } from './container'
import { LogMiddleware } from '../use-cases/middleware/log.middleware.ts'
import { EmptyMiddleware } from '../use-cases/middleware/empty.middleware.ts'
import { UseCaseService } from '../use-cases/use-case.service.ts'
import type { Middleware } from '../use-cases/middleware/middleware.ts'

export class CoreContainer extends Container {
  protected registerInstances(): void {
    const logger = new ConsoleLogger()
    this.register(ConsoleLogger.ID, logger)

    const emptyMiddleware = new EmptyMiddleware()
    this.register(EmptyMiddleware.ID, emptyMiddleware)

    const logMiddleware = new LogMiddleware(logger)

    this.register(LogMiddleware.ID, logMiddleware)

    const middlewares = [
      this.get<Middleware>(LogMiddleware.ID),
      this.get<Middleware>(EmptyMiddleware.ID)
    ]

    const useCaseService = new UseCaseService(middlewares, this)
    this.register(UseCaseService.ID, useCaseService)
  }
}
