import { Elysia } from "elysia";
import { UseCaseService } from "core";
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { ApiContainer } from "./api.container";
import { authRoutes } from "./auth/auth.routes";
import { GetWaterPointsQry } from "./features/water-point/application/get-water-points.qry";

const container = new ApiContainer();
const useCaseService = container.get<UseCaseService>(UseCaseService.ID)

const app = new Elysia({ prefix: '/api'})
	.use(cors({
		origin: 'http://localhost:3001',
		credentials: true
	}))
	.use(swagger())
	.use(authRoutes)
	.onRequest(({ request }) => {
		console.log(`${new Date().toISOString()} - ${request.method} ${request.url}`);
	})
	.onAfterHandle(({ request, response }) => {
		console.log(`${new Date().toISOString()} - ${request.method} ${request.url} - ${response.status}`);
	})
	.onError(({ request, error, code }) => {
		console.error(`${new Date().toISOString()} - ERROR ${request.method} ${request.url} - ${code}: ${error.message}`);
		console.error(error.stack);
	})
	.get("/water-points", async () => {
		return useCaseService.execute(GetWaterPointsQry);
	})
	.listen(4000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
