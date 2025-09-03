import type { Query } from "core";
import type { WaterPointSchema } from "features/schemas/water-point.schema";
import { WaterPointRepository } from "features";
import { HolderSchema } from "features/schemas/holder.schema";

type HomeWaterPoint = Omit<WaterPointSchema, "holderId"> & {
	holder: HolderSchema;
};

export class GetWaterPointsQry implements Query<WaterPoint[]> {
	static readonly ID = "GetWaterPointsQry";

	constructor(
		private readonly waterPointRepository: WaterPointRepository,
		private readonly holderRepository: HolderRepository,
	) {}

	async handle(): Promise<HomeWaterPoint[]> {
		const waterPoints = await this.waterPointRepository.findAll();
		const holder = await this.holderRepository.findById(promise.id);

		return { waterPoint, holder };
	}
}
