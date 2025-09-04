import { CoreContainer, HttpClient } from 'core'
import { CreateIssueCmd } from '@/src/features/issue/application/create-issue.cmd'
import { IssueApiRestRepository } from '@/src/features/issue/infrastructure/issue.api-repository'
import { GetAnalysesQry } from '../../features/analysis/application/get-analyses.qry'
import { AnalysisApiRestRepository } from '../../features/analysis/infrastructure/analysis.api-rest-repository'
import { LoginCmd } from '../../features/auth/application/login.cmd'
import { AuthApiRestRepository } from '../../features/auth/infrastructure/auth.api-rest-repository'
import { GetWaterPointsQry } from '../../features/water-point/application/get-water-points.qry'
import { WaterPointApiRestRepository } from '../../features/water-point/infrastructure/water-point.api-rest-repository'
import { AUTH_REPOSITORY, ISSUE_REPOSITORY, WATER_REPOSITORY } from './injection-tokens'

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

    const createIssueCmd = new CreateIssueCmd(issueApiRestRepository)
    this.register(CreateIssueCmd.ID, createIssueCmd)

    const getWaterPointsQry = new GetWaterPointsQry(waterPointApiRestRepository)
    this.register(GetWaterPointsQry.ID, getWaterPointsQry)

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
