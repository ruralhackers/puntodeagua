import { CoreContainer } from "core";
import { GetWaterPointsQry } from "./features/water-point/application/get-water-points.qry";
import { WaterPointPrismaRepository } from "./features/water-point/infrastructure/water-point.prisma-repository";
import { AuthenticateUserCmd } from "./features/auth/application/authenticate-user.cmd";
import { UserPrismaRepository } from "./features/auth/infrastructure/user.prisma-repository";
import {WATER_REPOSITORY, USER_REPOSITORY} from "./core/di/injection-tokens";
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

        const userPrismaRepository = new UserPrismaRepository(client);
        this.register(USER_REPOSITORY, userPrismaRepository);

        // Note: We register the command without JWT function as it will be injected at runtime
        const authenticateUserCmd = new AuthenticateUserCmd(
            userPrismaRepository,
            async () => { throw new Error("JWT function not injected"); }
        );
        this.register(AuthenticateUserCmd.ID, authenticateUserCmd);
	}
}

export const apiContainer = new ApiContainer();
