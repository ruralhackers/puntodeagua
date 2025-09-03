import swagger from "@elysiajs/swagger";
import {Elysia} from "elysia";

export const baseApiRest = new Elysia({
    name: "@app/ctx",
})
    .use(swagger())
    .get("/api", ({ path }) => path)
