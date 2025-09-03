import {Elysia} from "elysia";
import {waterPointApiRest} from "./features/water-point/delivery/water-point.api-rest";


export const app = new Elysia().use(waterPointApiRest).listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
