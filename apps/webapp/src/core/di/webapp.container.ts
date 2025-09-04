import { CoreContainer, HttpClient, UseCaseService } from 'core'
import { EmptyMiddleware } from 'core/use-cases/middleware/empty.middleware'
import { LogMiddleware } from 'core/use-cases/middleware/log.middleware'
import type { Middleware } from 'core/use-cases/middleware/middleware'
// import { AuthHttpClient } from '@/src/features/auth/infrastructure/auth-http-client'
import { CreateIssueCmd } from '@/src/features/issue/application/create-issue.cmd'
import { GetIssueByIdQry } from '@/src/features/issue/application/get-issue-by-id.qry'
import { SaveIssueCmd } from '@/src/features/issue/application/save-issue.cmd'
import { IssueApiRestRepository } from '@/src/features/issue/infrastructure/issue.api-rest-repository'
import { GetWaterMeterQry } from '@/src/features/water-meter/application/get-water-meter.qry'
import { CreateWaterMeterReadingCmd } from '@/src/features/water-meter-reading/application/create-water-meter-reading.cmd'
import { DeleteWaterMeterReadingCmd } from '@/src/features/water-meter-reading/application/delete-water-meter-reading.cmd'
import { WaterMeterReadingApiRestRepository } from '@/src/features/water-meter-reading/infrastructure/water-meter-reading.api-rest-repository'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'
import { WaterZoneApiRestRepository } from '@/src/features/water-zone/infrastructure/water-zone.api-rest-repository'
import { CreateAnalysisCmd } from '../../features/analysis/application/create-analysis.cmd'
import { DeleteAnalysisCmd } from '../../features/analysis/application/delete-analysis.cmd'
import { EditAnalysisCmd } from '../../features/analysis/application/edit-analysis.cmd'
import { GetAnalysesQry } from '../../features/analysis/application/get-analyses.qry'
import { GetAnalysisQry } from '../../features/analysis/application/get-analysis.qry'
import { AnalysisApiRestRepository } from '../../features/analysis/infrastructure/analysis.api-rest-repository'
import { LoginCmd } from '../../features/auth/application/login.cmd'
import { AuthApiRestRepository } from '../../features/auth/infrastructure/auth.api-rest-repository'
import { CreateMaintenanceCmd } from '../../features/maintenance/application/create-maintenance.cmd'
import { GetMaintenancesQry } from '../../features/maintenance/application/get-maintenances.qry'
import { MaintenanceApiRestRepository } from '../../features/maintenance/infrastructure/maintenance.api-rest-repository'
import { GetUsersQry } from '../../features/user/application/get-users.qry'
import { UserApiRestRepository } from '../../features/user/infrastructure/user.api-rest-repository'
import { GetWaterMetersQry } from '../../features/water-meter/application/get-water-meters.qry'
import { WaterMeterApiRestRepository } from '../../features/water-meter/infrastructure/water-meter.api-rest-repository'
import { GetWaterPointsQry } from '../../features/water-point/application/get-water-points.qry'
import { WaterPointApiRestRepository } from '../../features/water-point/infrastructure/water-point.api-rest-repository'
import {
  AUTH_REPOSITORY,
  ISSUE_REPOSITORY,
  MAINTENANCE_REPOSITORY,
  USER_REPOSITORY,
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

    const getWaterMeterQry = new GetWaterMeterQry(waterMeterApiRestRepository)
    this.register(GetWaterMeterQry.ID, getWaterMeterQry)

    const authApiRestRepository = new AuthApiRestRepository(httpClient)
    this.register(AUTH_REPOSITORY, authApiRestRepository)

    const loginCmd = new LoginCmd(authApiRestRepository)
    this.register(LoginCmd.ID, loginCmd)

    //analysis
    const analysisRepository = new AnalysisApiRestRepository(httpClient)
    const getAnalysesQry = new GetAnalysesQry(analysisRepository)
    this.register(GetAnalysesQry.ID, getAnalysesQry)
    const getAnalysisQry = new GetAnalysisQry(analysisRepository)
    this.register(GetAnalysisQry.ID, getAnalysisQry)
    const createAnalysisCmd = new CreateAnalysisCmd(analysisRepository)
    this.register(CreateAnalysisCmd.ID, createAnalysisCmd)
    const editAnalysisCmd = new EditAnalysisCmd(analysisRepository)
    this.register(EditAnalysisCmd.ID, editAnalysisCmd)
    const deleteAnalysisCmd = new DeleteAnalysisCmd(analysisRepository)
    this.register(DeleteAnalysisCmd.ID, deleteAnalysisCmd)

    // water zones
    const waterZoneApiRestRepository = new WaterZoneApiRestRepository(httpClient)
    const getWaterZonesQry = new GetWaterZonesQry(waterZoneApiRestRepository)
    this.register(GetWaterZonesQry.ID, getWaterZonesQry)

    const getIssueByIdQry = new GetIssueByIdQry(issueApiRestRepository)
    this.register(GetIssueByIdQry.ID, getIssueByIdQry)

    const createIssueCmd = new CreateIssueCmd(issueApiRestRepository)
    this.register(CreateIssueCmd.ID, createIssueCmd)

    // Water meter reading commands
    const waterMeterReadingApiRestRepository = new WaterMeterReadingApiRestRepository(httpClient)
    const createWaterMeterReadingCmd = new CreateWaterMeterReadingCmd(
      waterMeterReadingApiRestRepository
    )
    this.register(CreateWaterMeterReadingCmd.ID, createWaterMeterReadingCmd)

    const deleteWaterMeterReadingCmd = new DeleteWaterMeterReadingCmd(
      waterMeterReadingApiRestRepository
    )
    this.register(DeleteWaterMeterReadingCmd.ID, deleteWaterMeterReadingCmd)

    // User management
    const userApiRestRepository = new UserApiRestRepository(httpClient)
    this.register(USER_REPOSITORY, userApiRestRepository)

    const getUsersQry = new GetUsersQry(userApiRestRepository)
    this.register(GetUsersQry.ID, getUsersQry)
    // maintenance
    const maintenanceRepository = new MaintenanceApiRestRepository(httpClient)
    this.register(MAINTENANCE_REPOSITORY, maintenanceRepository)
    const getMaintenancesQry = new GetMaintenancesQry(maintenanceRepository)
    this.register(GetMaintenancesQry.ID, getMaintenancesQry)
    const createMaintenanceCmd = new CreateMaintenanceCmd(maintenanceRepository)
    this.register(CreateMaintenanceCmd.ID, createMaintenanceCmd)

    const middlewares = [
      this.get<Middleware>(LogMiddleware.ID),
      this.get<Middleware>(EmptyMiddleware.ID)
    ]

    const useCaseService = new UseCaseService(middlewares, this)
    this.register(UseCaseService.ID, useCaseService)
  }
}

export const webAppContainer = new WebappContainer()
