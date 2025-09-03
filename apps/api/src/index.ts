import { Elysia } from 'elysia'
import swagger from '@elysiajs/swagger'
import { waterPointApiRest } from './features/water-point/delivery/water-point.api-rest'

export const app = new Elysia({ prefix: '/api' }).use(swagger()).use(waterPointApiRest).listen(4000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
