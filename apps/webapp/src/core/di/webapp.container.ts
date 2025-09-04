import { CoreContainer, HttpClient, UseCaseService } from 'core'
import { EmptyMiddleware } from 'core/use-cases/middleware/empty.middleware'
import { LogMiddleware } from 'core/use-cases/middleware/log.middleware'
import type { Middleware } from 'core/use-cases/middleware/middleware'
import { SaveIssueCmd } from '@/src/features/issue/application/save-issue.cmd'
import { IssueApiRestRepository } from '@/src/features/issue/infrastructure/issue.api-repository'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'
import { WaterZoneApiRestRepository } from '@/src/features/water-zone/infrastructure/water-zone.api-rest-repository'
import { CreateAnalysisCmd } from '../../features/analysis/application/create-analysis.cmd'
import { GetAnalysesQry } from '../../features/analysis/application/get-analyses.qry'
import { GetAnalysisQry } from '../../features/analysis/application/get-analysis.qry'
import { AnalysisApiRestRepository } from '../../features/analysis/infrastructure/analysis.api-rest-repository'
import { LoginCmd } from '../../features/auth/application/login.cmd'
import { AuthApiRestRepository } from '../../features/auth/infrastructure/auth.api-rest-repository'
import { GetWaterMetersQry } from '../../features/water-meter/application/get-water-meters.qry'
import { WaterMeterApiRestRepository } from '../../features/water-meter/infrastructure/water-meter.api-rest-repository'
import { GetWaterPointsQry } from '../../features/water-point/application/get-water-points.qry'
import { WaterPointApiRestRepository } from '../../features/water-point/infrastructure/water-point.api-rest-repository'
import {
  AUTH_REPOSITORY,
  ISSUE_REPOSITORY,
  WATER_METER_REPOSITORY,
  WATER_REPOSITORY
} from './injection-tokens'

export class WebappContainer extends CoreContainer {
  protected override registerInstances(): void {
    super.registerInstances()

    const httpClient = new HttpClient(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    )
    this.register(HttpClient.ID, httpClient)

    const waterPointApiRestRepository = new WaterPointApiRestRepository(httpClient)
    this.register(WATER_REPOSITORY, waterPointApiRestRepository)

    const issueApiRestRepository = new IssueApiRestRepository(httpClient)
    this.register(ISSUE_REPOSITORY, issueApiRestRepository)

    const saveIssueCmd = new SaveIssueCmd(issueApiRestRepository)
    this.register(SaveIssueCmd.ID, saveIssueCmd)

    const getWaterPointsQry = new GetWaterPointsQry(waterPointApiRestRepository)
    this.register(GetWaterPointsQry.ID, getWaterPointsQry)

    const waterMeterApiRestRepository = new WaterMeterApiRestRepository(httpClient)
    this.register(WATER_METER_REPOSITORY, waterMeterApiRestRepository)

    const getWaterMetersQry = new GetWaterMetersQry(waterMeterApiRestRepository)
    this.register(GetWaterMetersQry.ID, getWaterMetersQry)

    const authApiRestRepository = new AuthApiRestRepository(httpClient)
    this.register(AUTH_REPOSITORY, authApiRestRepository)

    const loginCmd = new LoginCmd(authApiRestRepository)
    this.register(LoginCmd.ID, loginCmd)

    const analysisRepository = new AnalysisApiRestRepository(httpClient)
    const getAnalysesQry = new GetAnalysesQry(analysisRepository)
    this.register(GetAnalysesQry.ID, getAnalysesQry)

    const getAnalysisQry = new GetAnalysisQry(analysisRepository)
    this.register(GetAnalysisQry.ID, getAnalysisQry)

    const createAnalysisCmd = new CreateAnalysisCmd(analysisRepository)
    this.register(CreateAnalysisCmd.ID, createAnalysisCmd)

    const waterZoneApiRestRepository = new WaterZoneApiRestRepository(httpClient)
    const getWaterZonesQry = new GetWaterZonesQry(waterZoneApiRestRepository)
    this.register(GetWaterZonesQry.ID, getWaterZonesQry)

    const middlewares = [
      this.get<Middleware>(LogMiddleware.ID),
      this.get<Middleware>(EmptyMiddleware.ID)
    ]

    const useCaseService = new UseCaseService(middlewares, this)
    this.register(UseCaseService.ID, useCaseService)
  }
}

export const webAppContainer = new WebappContainer()
