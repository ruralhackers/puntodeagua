import { CoreContainer, UseCaseService } from 'core'
import { EmptyMiddleware } from 'core/use-cases/middleware/empty.middleware'
import { LogMiddleware } from 'core/use-cases/middleware/log.middleware'
import type { Middleware } from 'core/use-cases/middleware/middleware'
import { client } from 'database'
import { ISSUE_REPOSITORY } from 'webapp/src/core/di/injection-tokens'
import {
  ANALYSIS_REPOSITORY,
  USER_REPOSITORY,
  WATER_METER_READING_REPOSITORY,
  WATER_METER_REPOSITORY,
  WATER_REPOSITORY
} from './core/di/injection-tokens'
import { GetAnalysesQry } from './features/analysis/application/get-analyses.qry'
import { AnalysisPrismaRepository } from './features/analysis/infrastructure/analysis.prisma-repository'
import { AuthenticateUserCmd } from './features/auth/application/authenticate-user.cmd'
import { UserPrismaRepository } from './features/auth/infrastructure/user.prisma-repository'
import { SaveIssueCmd } from './features/issue/application/save-issue.cmd'
import { IssuePrismaRepository } from './features/issue/infrastructure/issue.prisma-repository'
import { GetWaterMeterQry } from './features/water-meter/application/get-water-meter.qry'
import { GetWaterMetersQry } from './features/water-meter/application/get-water-meters.qry'
import { GetWaterMeterReadingsQry } from './features/water-meter-reading/application/get-water-meter-readings.qry'
import { WaterMeterReadingPrismaRepository } from './features/water-meter-reading/infrastructure/water-meter-reading.prisma-repository'
import { GetWaterPointsQry } from './features/water-point/application/get-water-points.qry'
import { WaterMeterPrismaRepository } from './features/water-point/infrastructure/water-meter.prisma-repository'
import { WaterPointPrismaRepository } from './features/water-point/infrastructure/water-point.prisma-repository'

export class ApiContainer extends CoreContainer {
  protected override registerInstances(): void {
    super.registerInstances()

    const waterPointPrismaRepository = new WaterPointPrismaRepository(client)
    this.register(WATER_REPOSITORY, waterPointPrismaRepository)

    const getWaterPointsQry = new GetWaterPointsQry(waterPointPrismaRepository)
    this.register(GetWaterPointsQry.ID, getWaterPointsQry)

    const waterMeterPrismaRepository = new WaterMeterPrismaRepository(client)
    this.register(WATER_METER_REPOSITORY, waterMeterPrismaRepository)

    const getWaterMetersQry = new GetWaterMetersQry(waterMeterPrismaRepository)
    this.register(GetWaterMetersQry.ID, getWaterMetersQry)

    // Water Meter Readings
    const waterMeterReadingPrismaRepository = new WaterMeterReadingPrismaRepository(client)
    this.register(WATER_METER_READING_REPOSITORY, waterMeterReadingPrismaRepository)

    const getWaterMeterReadingsQry = new GetWaterMeterReadingsQry(waterMeterReadingPrismaRepository)
    this.register(GetWaterMeterReadingsQry.ID, getWaterMeterReadingsQry)

    const userPrismaRepository = new UserPrismaRepository(client)
    this.register(USER_REPOSITORY, userPrismaRepository)

    const issuePrismaRepository = new IssuePrismaRepository(client)
    this.register(ISSUE_REPOSITORY, issuePrismaRepository)

    const saveIssueCmd = new SaveIssueCmd(issuePrismaRepository)
    this.register(SaveIssueCmd.ID, saveIssueCmd)

    // Analysis
    const analysisRepository = new AnalysisPrismaRepository(client)
    this.register(ANALYSIS_REPOSITORY, analysisRepository)
    const getAnalysesQry = new GetAnalysesQry(analysisRepository)
    this.register(GetAnalysesQry.ID, getAnalysesQry)

    // Note: We register the command without JWT function as it will be injected at runtime
    const authenticateUserCmd = new AuthenticateUserCmd(userPrismaRepository, async () => {
      throw new Error('JWT function not injected')
    })
    this.register(AuthenticateUserCmd.ID, authenticateUserCmd)

    const middlewares = [
      this.get<Middleware>(LogMiddleware.ID),
      this.get<Middleware>(EmptyMiddleware.ID)
    ]

    const useCaseService = new UseCaseService(middlewares, this)
    this.register(UseCaseService.ID, useCaseService)
  }
}

export const apiContainer = new ApiContainer()
