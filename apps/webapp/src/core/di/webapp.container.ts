import {CoreContainer, HttpClient} from "core";
import {WaterPointApiRestRepository} from "../../features/water-point/infrastructure/water-point.api-rest-repository";
import {AuthApiRestRepository} from "../../features/auth/infraestructure/auth.api-rest-repository";
import {WATER_REPOSITORY, AUTH_REPOSITORY} from "./injection-tokens";
import {GetWaterPointsQry} from "../../features/water-point/application/get-water-points.qry";

export class WebappContainer extends CoreContainer {
    protected override registerInstances(): void {
        super.registerInstances();

        const httpClient = new HttpClient(process.env.NEXT_PUBLIC_API_URL!);
        this.register(HttpClient.ID, httpClient);

        const waterPointApiRestRepository = new WaterPointApiRestRepository(httpClient);
        this.register(
            WATER_REPOSITORY,
            waterPointApiRestRepository
        );

        const authApiRestRepository = new AuthApiRestRepository(httpClient);
        this.register(
            AUTH_REPOSITORY,
            authApiRestRepository
        );

        const getWaterPointsQry = new GetWaterPointsQry(waterPointApiRestRepository);
        this.register(GetWaterPointsQry.ID, getWaterPointsQry);
    }
}

export const webAppContainer = new WebappContainer();
