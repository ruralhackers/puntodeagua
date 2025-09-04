import { CoreContainer } from 'core'
import { client } from 'database'
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
  }
}

export const apiContainer = new ApiContainer()
