import { CoreContainer } from "core";
import { GetWaterPointsQry } from "./features/water-point/application/get-water-points.qry";
import { WaterPointPrismaRepository } from "./features/water-point/infrastructure/water-point.prisma-repository";
import {WATER_REPOSITORY} from "./core/di/injection-tokens";
import {client} from "database";

export class ApiContainer extends CoreContainer {
	protected override registerInstances(): void {
		// Register core dependencies first
		super.registerInstances();

		// Register API-specific use cases
		const getWaterPointsQry = new GetWaterPointsQry();
		this.register(GetWaterPointsQry.ID, getWaterPointsQry);

		this.register(
			WATER_REPOSITORY,
			new WaterPointPrismaRepository(client),
		);
	}
}

export const apiContainer = new ApiContainer();
