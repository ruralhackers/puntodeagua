import { ConsoleLogger } from "../logger/console-logger";
import { Container } from "./container";
import { LogMiddleware } from "../use-cases/middleware/log.middleware.ts";
import { UseCaseService } from "../use-cases/use-case.service.ts";

/**
 * Core container implementation that extends the abstract Container class.
 * This implements the template pattern by providing the registerInstances method.
 */
export class CoreContainer extends Container {
	protected registerInstances(): void {
		const logger = new ConsoleLogger();
		this.register(logger);

		const logMiddleware = new LogMiddleware(logger);

		const middlewares = [logMiddleware];

		for (const middleware of middlewares) {
			this.register(middleware);
		}

		const useCaseService = new UseCaseService(middlewares, this);
		this.register(useCaseService);
	}
}

/**
 * @deprecated Use CoreContainer class directly instead of this function.
 * This function is kept for backward compatibility.
 */
export function registerCoreDependencies(container: Container): void {
	const logger = new ConsoleLogger();
	container.register(logger);

	const logMiddleware = new LogMiddleware(logger);

	const middlewares = [logMiddleware];

	for (const middleware of middlewares) {
		container.register(middleware);
	}

	const useCaseService = new UseCaseService(middlewares, container);
	container.register(useCaseService);
}
