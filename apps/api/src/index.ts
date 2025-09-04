import cors from '@elysiajs/cors'
import jwt from '@elysiajs/jwt'
import swagger from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { analysisApiRest } from './features/analysis/delivery/analysis.api-rest'
import { authApiRest } from './features/auth/delivery/auth.api-rest'
import { issueApiRest } from './features/issue/delivery/issue.api-rest'
import { waterMeterApiRest } from './features/water-meter/delivery/water-meter.api-rest'
import { waterMeterReadingApiRest } from './features/water-meter-reading/delivery/water-meter-reading.api-rest'
import { waterPointApiRest } from './features/water-point/delivery/water-point.api-rest'
import { waterZonesApiRest } from './features/water-zone/delivery/water-zone.api-rest'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const app = new Elysia({ prefix: '/api' })
  .use(swagger())
  .use(
    cors({
      origin: [/^http:\/\/localhost:3000$/],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET
    })
  )
  .use(waterPointApiRest)
  .use(waterZonesApiRest)
  .use(analysisApiRest)
  .use(waterMeterApiRest)
  .use(issueApiRest)
  .use(waterZonesApiRest)
  .use(waterMeterReadingApiRest)
  .use(authApiRest)
  .listen(4000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
