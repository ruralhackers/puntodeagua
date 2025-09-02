import {Elysia} from "elysia";
import {UseCaseService} from "core";
import {CreateWaterPointCommand} from "./create-water-point.cmd";

const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);

app.post("/water-point", async (params) =>{
    // TODO: Create container
    const useCaseService = container.get(UseCaseService);

    await useCaseService.execute(CreateWaterPointCommand, params)
});

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
