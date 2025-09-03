import type { Id } from "../value-object/id";

export interface FindableById<In> {
	findById(id: Id): Promise<In | undefined>;
}
