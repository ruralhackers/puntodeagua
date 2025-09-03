import {UseCaseService} from "core";
import {Elysia} from "elysia";
import {apiContainer} from "../../../api.container";
import {baseApiRest} from "../../../core/elysia/base-api-rest";
import { GetWaterPointsQry } from "../application/get-water-points.qry";

export const waterPointApiRest = new Elysia().use(baseApiRest).get("/water-points", async () => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID);
    const waterPoints =await useCaseService.execute(GetWaterPointsQry);
    return waterPoints.map(x=> x.toDto())
});
