import type { Logger } from "../../logger/logger";
import type { UseCase } from "../use-case";
import { UseCaseHandler } from "../use-case-handler";
import type { Middleware } from "./middleware";

export class ApiRestMiddleware implements Middleware {
	static readonly ID = "LogMiddleware";

	constructor(private readonly logger: Logger) {}

	async intercept(params: unknown, useCase: UseCase): Promise<unknown> {
		try {
			const result = await useCase.handle(params);
		} catch (e) {
			return 404;
		}
	}

	private getName(useCase: UseCase): string {
		if (useCase instanceof UseCaseHandler) {
			return this.getName(useCase.useCase);
		}

		return useCase.constructor.name;
	}

	private printResult(result: unknown) {
		return JSON.stringify(result, null, 2);
	}
}
