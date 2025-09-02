import type { Logger } from '../../logger/logger'
import type { UseCase } from '../use-case'
import { UseCaseHandler } from '../use-case-handler'
import type { Middleware } from './middleware'

export class LogMiddleware implements Middleware {
	constructor(private readonly logger: Logger) {}

	intercept(params: unknown, useCase: UseCase): Promise<unknown> {
		this.logger.log(
			`[${new Date()}] ${this.getName(useCase)} / ${this.printResult(params)}`,
		)
		return useCase.handle(params)
	}

	private getName(useCase: UseCase): string {
		if (useCase instanceof UseCaseHandler) {
			return this.getName(useCase.useCase)
		}

		return useCase.constructor.name
	}

	private printResult(result: unknown) {
		return JSON.stringify(result, null, 2)
	}
}
