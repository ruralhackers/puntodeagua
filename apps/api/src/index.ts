import cors from '@elysiajs/cors'
import jwt from '@elysiajs/jwt'
import swagger from '@elysiajs/swagger'
import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import type { UserRepository } from 'features'
import { apiContainer } from './api.container'
import { analysisApiRest } from './features/analysis/delivery/analysis.api-rest'
import { loginSchema } from './features/auth/application/auth.schema'
import { AuthenticateUserCmd } from './features/auth/application/authenticate-user.cmd'
import { authApiRest } from './features/auth/delivery/auth.api-rest'
import { holderApiRest } from './features/holder/delivery/holder.api-rest'
import { issueApiRest } from './features/issue/delivery/issue.api-rest'
import { maintenanceApiRest } from './features/maintenance/delivery/maintenance.api-rest'
import { GetSummaryQry } from './features/summary/application/get-summary.qry'
import { userApiRest } from './features/user/delivery/user.api-rest'
import { waterMeterApiRest } from './features/water-meter/delivery/water-meter.api-rest'
import { waterMeterReadingApiRest } from './features/water-meter-reading/delivery/water-meter-reading.api-rest'
import { waterPointApiRest } from './features/water-point/delivery/water-point.api-rest'
import { waterZonesApiRest } from './features/water-zone/delivery/water-zone.api-rest'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
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
  .use(waterPointApiRest)
  .use(waterZonesApiRest)
  .use(maintenanceApiRest)
  .use(analysisApiRest)
  .use(waterMeterApiRest)
  .use(issueApiRest)
  .use(waterMeterReadingApiRest)
  .use(userApiRest)
  .get('/summary', async ({ query }) => {
    const useCaseService = apiContainer.get<UseCaseService>(UseCaseService.ID)

    // Parse query parameters if provided
    const params = {
      month: query.month ? parseInt(query.month as string) : undefined,
      year: query.year ? parseInt(query.year as string) : undefined
    }

    const summary = await useCaseService.execute(GetSummaryQry, params)
    return {
      analyses: summary.analyses.map((x) => x.toDto()),
      issues: summary.issues.map((x) => x.toDto()),
      maintenance: summary.maintenance.map((x) => x.toDto())
    }
  })
  .use(authApiRest)
  .use(holderApiRest)
  .listen(PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
