import { Id } from "core";
import type { CommunitySchema } from "../schemas/community.schema.ts";

export class Community {
	private constructor(
		private readonly id: Id,
		private readonly name: string,
		private readonly planId: Id,
	) {}

	static create(communitySchema: CommunitySchema) {
		return new Community(
			Id.create(communitySchema.id),
			communitySchema.name,
			Id.create(communitySchema.planId),
		);
	}
}
