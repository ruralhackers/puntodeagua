import { Id } from "core";
import type { HolderSchema } from "../schemas/holder.schema.ts";

export class Holder {
	private constructor(
		private readonly id: Id,
		private readonly name: string,
	) {}

	static create(holderSchema: HolderSchema) {
		return new Holder(Id.create(holderSchema.id), holderSchema.name);
	}
}
