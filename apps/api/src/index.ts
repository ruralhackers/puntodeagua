import cors from '@elysiajs/cors'
import swagger from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { analysisApiRest } from './features/analysis/delivery/analysis.api-rest'
import { authApiRest } from './features/auth/delivery/auth.api-rest'
import { holderApiRest } from './features/holder/delivery/holder.api-rest'
import { issueApiRest } from './features/issue/delivery/issue.api-rest'
import { maintenanceApiRest } from './features/maintenance/delivery/maintenance.api-rest'
import { providersApiRest } from './features/providers/delivery/providers.api-rest'
import { registrosApiRest } from './features/registros/delivery/registros.api-rest'
import { summaryApiRest } from './features/summary/delivery/summary.api-rest'
import { userApiRest } from './features/user/delivery/user.api-rest'
import { waterMeterApiRest } from './features/water-meter/delivery/water-meter.api-rest'
import { waterMeterReadingApiRest } from './features/water-meter-reading/delivery/water-meter-reading.api-rest'
import { waterPointApiRest } from './features/water-point/delivery/water-point.api-rest'
import { waterZonesApiRest } from './features/water-zone/delivery/water-zone.api-rest'
import { authMiddleware } from './middleware/auth.middleware'

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000
const WEBAPP_ORIGIN = process.env.WEBAPP_ORIGIN || 'http://localhost:3000'

const publicApi = new Elysia().use(authApiRest).use(summaryApiRest)
const privateApi = new Elysia()
  .use(authMiddleware)
  .use(waterPointApiRest)
  .use(waterZonesApiRest)
  .use(maintenanceApiRest)
  .use(providersApiRest)
  .use(analysisApiRest)
  .use(waterMeterApiRest)
  .use(issueApiRest)
  .use(waterMeterReadingApiRest)
  .use(userApiRest)
  .use(registrosApiRest)
  .use(holderApiRest)

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
  .use(publicApi)
  .use(privateApi)
  .onError((error) => {
    console.error('Error occurred:', error)
  })
  .listen(PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
