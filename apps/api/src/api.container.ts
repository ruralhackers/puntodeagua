import { CoreContainer } from "core";
import { GetWaterPointsQry } from "./features/water-point/application/get-water-points.qry";
import { WaterPointPrismaRepository } from "./features/water-point/infrastructure/water-point.prisma-repository";
import {WATER_REPOSITORY} from "./core/di/injection-tokens";
import {client} from "database";

export class ApiContainer extends CoreContainer {
	protected override registerInstances(): void {
		super.registerInstances();

        const waterPointPrismaRepository = new WaterPointPrismaRepository(client);
        this.register(
			WATER_REPOSITORY,
			waterPointPrismaRepository,
		);

        const getWaterPointsQry = new GetWaterPointsQry(waterPointPrismaRepository);
        this.register(GetWaterPointsQry.ID, getWaterPointsQry);
	}
}

export const apiContainer = new ApiContainer();
