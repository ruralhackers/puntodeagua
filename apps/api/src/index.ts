import {Elysia} from "elysia";
import swagger from "@elysiajs/swagger";
import {apiContainer} from "./api.container";
import {UseCaseService} from "core";
import {GetWaterPointsQry} from "./features/water-point/application/get-water-points.qry";

export const app = new Elysia({ prefix: '/api'}).use(swagger()).get("/water-points", async () => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID);
    const waterPoints = await useCaseService.execute(GetWaterPointsQry);
    return waterPoints.map(x => x.toDto())
}).listen(4000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
