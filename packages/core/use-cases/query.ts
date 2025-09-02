import type { UseCase } from "./use-case";

export interface Query<Return, Param = void> extends UseCase<Param, Return> {}
