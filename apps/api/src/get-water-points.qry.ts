import type {Query} from "core";
import type {WaterPointSchema} from "features/schemas/water-point.schema";

export class GetWaterPointsQry implements Query<WaterPointSchema[]> {
	static readonly ID = "GetWaterPointsQry";

	async handle(): Promise<WaterPointSchema[]> {
		return []
	}
}
