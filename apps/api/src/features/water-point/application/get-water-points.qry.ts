import type {Query} from "core";
import {WaterPoint} from "features/entities/water-point";
import type {WaterPointRepository} from "features";

export class GetWaterPointsQry implements Query<WaterPoint[]> {
	static readonly ID = "GetWaterPointsQry";

    constructor(private readonly waterPointRepository: WaterPointRepository) {
    }

	async handle(): Promise<WaterPoint[]> {
		return this.waterPointRepository.findAll()
	}
}
