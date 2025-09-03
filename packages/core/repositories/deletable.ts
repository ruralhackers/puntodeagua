import type { Id } from "../value-object/id";
export interface Deletable {
	delete(id: Id): Promise<void>;
}
