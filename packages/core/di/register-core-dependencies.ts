import {ConsoleLogger} from '../logger/console-logger'
import type {Container} from './container'
import {LogMiddleware} from "../use-cases/middleware/log.middleware.ts";
import {UseCaseService} from "../use-cases/use-case.service.ts";

export function registerCoreDependencies(container: Container): void {
	const logger = new ConsoleLogger()
	container.register(logger)

	const logMiddleware = new LogMiddleware(logger)

	const middlewares = [
		logMiddleware,
	]

	middlewares.forEach(m => container.register(m))

	const useCaseService = new UseCaseService(middlewares, container)
	container.register(useCaseService)
}
