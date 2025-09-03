import {Id} from "../../core/value-object/id.ts";
import type {WaterPointSchema} from "../schemas/water-point.schema.ts";
import {Location} from "./location.ts";
import type {WaterPointDto} from "./water-point.dto.ts";

export class WaterPoint {
	private constructor(
		private readonly id: Id,
		private readonly location: Location,
		private readonly communityId: Id,
		private readonly note?: string,
	) {}

	static create({ id, location, description, communityId }: WaterPointSchema) {
		return new WaterPoint(
			Id.create(id),
			Location.create(location),
			Id.create(communityId),
			description,
		);
	}

    toDto(): WaterPointDto {
        return {
            id: this.id.toString(),
            location: this.location.toString(),
            communityId: this.communityId.toString(),
            note: this.note,
        }
    }
}
