import {CoreContainer, HttpClient} from "core";
import {GetWaterPointsQry} from "@/features/water-point/application/get-water-points.qry";
import {WaterPointApiRestRepository} from "@/features/water-point/infrastructure/water-point.api-rest-repository";
import {WATER_REPOSITORY} from "@/core/di/injection-tokens";

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

        const getWaterPointsQry = new GetWaterPointsQry(waterPointApiRestRepository);
        this.register(GetWaterPointsQry.ID, getWaterPointsQry);
    }
}

export const webAppContainer = new WebappContainer();
