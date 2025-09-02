import type { Container } from "../di/container";
import type { Type } from "../types/type";
import type { UseCase } from "./use-case";
import type { UseCaseOptions } from "./use-case-options";
import type { Middleware } from "./middleware/middleware.ts";
import { EmptyMiddleware } from "./middleware/empty.middleware.ts";
import { UseCaseHandler } from "./use-case-handler.ts";

export class UseCaseService {
	static readonly ID = "UseCaseService";

	constructor(
		private middlewares: Middleware[],
		private readonly container: Container,
	) {}

	async execute<In, Out>(
		useCase: Type<UseCase<In, Out>>,
		param?: In,
		options?: UseCaseOptions,
	): Promise<Out> {
		const requiredOptions = options ?? {
			silentError: false,
		};

		let next = UseCaseHandler.create({
			next: this.container.get(useCase.ID),
			options: requiredOptions,
			middleware: this.container.get<EmptyMiddleware>(EmptyMiddleware.ID),
		});

		for (let i = this.middlewares.length - 1; i >= 0; i--) {
			const currentMiddleware = this.middlewares[i];
			const previous = next;
			next = UseCaseHandler.create({
				next: previous,
				middleware: currentMiddleware!,
				options: requiredOptions,
			});
		}

		return next.handle(param) as Promise<Out>;
	}
}
