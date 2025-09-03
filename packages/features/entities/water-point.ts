import { Location } from "core";
import { Id } from "core/value-object/id.ts";
import type { WaterPointSchema } from "../schemas/water-point.schema.ts";

export class WaterPoint {
	private constructor(
		private readonly id: Id,
		private readonly location: Location,
		private readonly communityId: Id,
		private readonly description?: string,
	) {}

	static create({ id, location, description, communityId }: WaterPointSchema) {
		return new WaterPoint(
			Id.create(id),
			Location.create(location),
			Id.create(communityId),
			description,
		);
	}

	toDto() {
		return {
			id: this.id.toString(),
			location: this.location.toString(),
			communityId: this.communityId.toString(),
			description: this.description,
		};
	}
}
