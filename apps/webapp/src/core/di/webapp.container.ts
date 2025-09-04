import { CoreContainer, HttpClient } from 'core'
import { SaveIssueCmd } from '@/src/features/issue/application/save-issue.cmd'
import { IssueApiRestRepository } from '@/src/features/issue/infrastructure/issue.api-repository'
import { GetAnalysesQry } from '../../features/analysis/application/get-analyses.qry'
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
  }
}

export const webAppContainer = new WebappContainer()
