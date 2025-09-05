import cors from '@elysiajs/cors'
import swagger from '@elysiajs/swagger'
import { UseCaseService } from 'core'
import { Elysia } from 'elysia'
import { apiContainer } from './api.container'
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
import { GetSummaryQry } from './features/(public)/summary/application/get-summary.qry'
import { authMiddleware } from './middleware/auth-middleware'

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000
const WEBAPP_ORIGIN = process.env.WEBAPP_ORIGIN || 'http://localhost:3000'

// Public API group (no authentication required)
const publicApi = new Elysia().use(authApiRest).get('/summary', async ({ query }) => {
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

// Private API group (authentication required)
const privateApi = authMiddleware(new Elysia())
  .use(waterPointApiRest)
  .use(waterZonesApiRest)
  .use(maintenanceApiRest)
  .use(analysisApiRest)
  .use(waterMeterApiRest)
  .use(issueApiRest)
  .use(waterMeterReadingApiRest)
  .use(userApiRest)
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
  .listen(PORT)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
