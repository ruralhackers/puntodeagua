import { Elysia } from "elysia";
import { UseCaseService } from "core";
import { swagger } from '@elysiajs/swagger'
import {GetWaterPointsQry} from "./get-water-points.qry";
import { ApiContainer } from "./api.container";


const container = new ApiContainer();
const useCaseService = container.get<UseCaseService>(UseCaseService.ID)

const app = new Elysia().use(swagger()).get("/api", ({ path}) => path).listen(3000);



app.get("/water-points", async () => {
	return useCaseService.execute(GetWaterPointsQry);
});

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
