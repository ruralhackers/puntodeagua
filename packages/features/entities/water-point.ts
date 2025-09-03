import { Location } from "core";
import { Id } from "core/value-object/id.ts";
import type { WaterPointSchema } from "../schemas/water-point.schema.ts";

export class WaterPoint {
	private constructor(
		public readonly id: Id,
		public readonly communityId: Id,
		public readonly name: string,
		public location: Location,
		public  description?: string,
	) {}

	static create({ id, location, description, communityId, name }: WaterPointSchema) {
		return new WaterPoint(
			Id.create(id),
			Id.create(communityId),
			name,
			Location.create(location),
			description,
		);
	}

	toDto() {
		return {
			id: this.id.toString(),
			location: this.location.toString(),
			communityId: this.communityId.toString(),
			name: this.name,
			description: this.description,
		};
	}
}
