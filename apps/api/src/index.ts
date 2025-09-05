import cors from '@elysiajs/cors'
import swagger from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { analysisApiRest } from './features/(private)/analysis/delivery/analysis.api-rest'
import { holderApiRest } from './features/(private)/holder/delivery/holder.api-rest'
import { issueApiRest } from './features/(private)/issue/delivery/issue.api-rest'
import { maintenanceApiRest } from './features/(private)/maintenance/delivery/maintenance.api-rest'
import { userApiRest } from './features/(private)/user/delivery/user.api-rest'
import { waterMeterApiRest } from './features/(private)/water-meter/delivery/water-meter.api-rest'
import { waterMeterReadingApiRest } from './features/(private)/water-meter-reading/delivery/water-meter-reading.api-rest'
import { waterPointApiRest } from './features/(private)/water-point/delivery/water-point.api-rest'
import { waterZonesApiRest } from './features/(private)/water-zone/delivery/water-zone.api-rest'
import { authApiRest } from './features/(public)/auth/delivery/auth.api-rest'
import { summaryApiRest } from './features/(public)/summary/delivery/summary.api-rest'
import { authMiddleware } from './middleware/auth-middleware'

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000
const WEBAPP_ORIGIN = process.env.WEBAPP_ORIGIN || 'http://localhost:3000'

export const app = new Elysia({ prefix: '/api' })
  .use(swagger())
  .use(
    cors({
      origin: [WEBAPP_ORIGIN],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )
  //  Public API
  .use(authApiRest)
  .use(summaryApiRest)
  .use(authMiddleware)
  //  Private API
  .use(waterPointApiRest)
  .use(waterZonesApiRest)
  .use(maintenanceApiRest)
  .use(analysisApiRest)
  .use(waterMeterApiRest)
  .use(issueApiRest)
  .use(waterMeterReadingApiRest)
  .use(userApiRest)
  .use(holderApiRest)
  .listen(PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
