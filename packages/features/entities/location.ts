import type { LocationSchema } from "../schemas/location.schema.ts";

export class Location {
	private constructor(
		private readonly latitude: string,
		private readonly longitude: string,
	) {}

	static create(locationSchema: LocationSchema) {
		return new Location(locationSchema.latitude, locationSchema.longitude);
	}
}
