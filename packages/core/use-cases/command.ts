import type { UseCase } from "./use-case";

export interface Command<Param = void, Return = void>
	extends UseCase<Param, Return> {}
