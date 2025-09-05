import { CoreContainer, UseCaseService } from 'core'
import { EmptyMiddleware } from 'core/use-cases/middleware/empty.middleware'
import { LogMiddleware } from 'core/use-cases/middleware/log.middleware'
import type { Middleware } from 'core/use-cases/middleware/middleware'
import { client } from 'database'
import { FilePrismaRepository } from 'features'
import { ISSUE_REPOSITORY } from 'webapp/src/core/di/injection-tokens'
import {
  ANALYSIS_REPOSITORY,
  FILE_UPLOAD_SERVICE,
  HOLDER_REPOSITORY,
  MAINTENANCE_REPOSITORY,
  PROVIDER_REPOSITORY,
  STORAGE_SERVICE,
  USER_REPOSITORY,
  WATER_METER_READING_REPOSITORY,
  WATER_METER_REPOSITORY,
  WATER_POINT_REPOSITORY,
  WATER_ZONE_REPOSITORY
} from './core/di/injection-tokens'
import { CreateAnalysisCmd } from './features/analysis/application/create-analysis.cmd'
import { DeleteAnalysisCmd } from './features/analysis/application/delete-analysis.cmd'
import { EditAnalysisCmd } from './features/analysis/application/edit-analysis.cmd'
import { GetAnalysesQry } from './features/analysis/application/get-analyses.qry'
import { GetAnalysisQry } from './features/analysis/application/get-analysis.qry'
import { AnalysisPrismaRepository } from './features/analysis/infrastructure/analysis.prisma-repository'
import { AuthenticateUserCmd } from './features/auth/application/authenticate-user.cmd'
import { UserPrismaRepository } from './features/auth/infrastructure/user.prisma-repository'
import { CreateHolderCmd } from './features/holder/application/create-holder.cmd'
import { DeleteHolderCmd } from './features/holder/application/delete-holder.cmd'
import { EditHolderCmd } from './features/holder/application/edit-holder.cmd'
import { GetHolderQry } from './features/holder/application/get-holder.qry'
import { GetHoldersQry } from './features/holder/application/get-holders.qry'
import { HolderPrismaRepository } from './features/holder/infrastructure/holder.prisma-repository'
import { EditIssueCmd } from './features/issue/application/edit-issue.cmd'
import { GetIssueByIdQry } from './features/issue/application/get-issue-by-id.qry'
import { GetIssuesQry } from './features/issue/application/get-issues.qry'
import { SaveIssueCmd } from './features/issue/application/save-issue.cmd'
import { IssuePrismaRepository } from './features/issue/infrastructure/issue.prisma-repository'
import { GetMaintenanceQry } from './features/maintenance/application/get-maintenance.qry'
import { GetMaintenancesQry } from './features/maintenance/application/get-maintenances.qry'
import { SaveMaintenanceCmd } from './features/maintenance/application/save-maintenance.cmd'
import { MaintenancePrismaRepository } from './features/maintenance/infrastructure/maintenance.prisma-repository'
import { CreateProviderCmd } from './features/providers/application/create-provider.cmd'
import { GetProviderQry } from './features/providers/application/get-provider.qry'
import { GetProvidersQry } from './features/providers/application/get-providers.qry'
import { SaveProviderCmd } from './features/providers/application/save-provider.cmd'
import { ProvidersPrismaRepository } from './features/providers/infrastructure/providers.prisma-repository'
import { GetRegistrosStatsQry } from './features/registros/application/get-registros-stats.qry'
import { GetSummaryQry } from './features/summary/application/get-summary.qry'
import { CreateUserCmd } from './features/user/application/create-user.cmd'
import { DeleteUserCmd } from './features/user/application/delete-user.cmd'
import { GetUsersQry } from './features/user/application/get-users.qry'
import { GetWaterMeterQry } from './features/water-meter/application/get-water-meter.qry'
import { GetWaterMetersQry } from './features/water-meter/application/get-water-meters.qry'
import { UpdateWaterMeterCmd } from './features/water-meter/application/update-water-meter.cmd'
import { WaterMeterPrismaRepository } from './features/water-meter/infrastructure/water-meter.prisma-repository'
import { CreateWaterMeterReadingCmd } from './features/water-meter-reading/application/create-water-meter-reading.cmd'
import { DeleteWaterMeterReadingCmd } from './features/water-meter-reading/application/delete-water-meter-reading.cmd'
import { GetWaterMeterReadingsQry } from './features/water-meter-reading/application/get-water-meter-readings.qry'
import { WaterMeterReadingPrismaRepository } from './features/water-meter-reading/infrastructure/water-meter-reading.prisma-repository'
import { CreateWaterPointCmd } from './features/water-point/application/create-water-point.cmd'
import { DeleteWaterPointCmd } from './features/water-point/application/delete-water-point.cmd'
import { EditWaterPointCmd } from './features/water-point/application/edit-water-point.cmd'
import { GetWaterPointQry } from './features/water-point/application/get-water-point.qry'
import { GetWaterPointsQry } from './features/water-point/application/get-water-points.qry'
import { WaterPointPrismaRepository } from './features/water-point/infrastructure/water-point.prisma-repository'
import { GetWaterZonesQry } from './features/water-zone/application/get-water-zones.qry'
import { WaterZonePrismaRepository } from './features/water-zone/infrastructure/water-zone.prisma-repository'
import { FileUploadService } from './infrastructure/file-upload/file-upload.service'
import { CloudflareR2Adapter } from './infrastructure/storage/cloudflare-r2-adapter'

export class ApiContainer extends CoreContainer {
  protected override registerInstances(): void {
    super.registerInstances()

    // Water Points
    const waterPointPrismaRepository = new WaterPointPrismaRepository(client)
    this.register(WATER_POINT_REPOSITORY, waterPointPrismaRepository)
    const getWaterPointsQry = new GetWaterPointsQry(waterPointPrismaRepository)
    this.register(GetWaterPointsQry.ID, getWaterPointsQry)
    const getWaterPointQry = new GetWaterPointQry(waterPointPrismaRepository)
    this.register(GetWaterPointQry.ID, getWaterPointQry)
    const createWaterPointCmd = new CreateWaterPointCmd(waterPointPrismaRepository)
    this.register(CreateWaterPointCmd.ID, createWaterPointCmd)
    const deleteWaterPointCmd = new DeleteWaterPointCmd(waterPointPrismaRepository)
    this.register(DeleteWaterPointCmd.ID, deleteWaterPointCmd)
    const editWaterPointCmd = new EditWaterPointCmd(waterPointPrismaRepository)
    this.register(EditWaterPointCmd.ID, editWaterPointCmd)

    // Water Meters
    const waterMeterPrismaRepository = new WaterMeterPrismaRepository(client)
    this.register(WATER_METER_REPOSITORY, waterMeterPrismaRepository)
    const getWaterMetersQry = new GetWaterMetersQry(waterMeterPrismaRepository)
    this.register(GetWaterMetersQry.ID, getWaterMetersQry)
    const getWaterMeterQry = new GetWaterMeterQry(waterMeterPrismaRepository)
    this.register(GetWaterMeterQry.ID, getWaterMeterQry)
    const updateWaterMeterCmd = new UpdateWaterMeterCmd(
      waterMeterPrismaRepository,
      waterPointPrismaRepository
    )
    this.register(UpdateWaterMeterCmd.ID, updateWaterMeterCmd)

    // Water Meter Readings
    const waterMeterReadingPrismaRepository = new WaterMeterReadingPrismaRepository(client)
    this.register(WATER_METER_READING_REPOSITORY, waterMeterReadingPrismaRepository)
    const getWaterMeterReadingsQry = new GetWaterMeterReadingsQry(waterMeterReadingPrismaRepository)
    this.register(GetWaterMeterReadingsQry.ID, getWaterMeterReadingsQry)

    const userPrismaRepository = new UserPrismaRepository(client)
    this.register(USER_REPOSITORY, userPrismaRepository)

    // Issues
    const issuePrismaRepository = new IssuePrismaRepository(client)
    this.register(ISSUE_REPOSITORY, issuePrismaRepository)
    const saveIssueCmd = new SaveIssueCmd(issuePrismaRepository)
    this.register(SaveIssueCmd.ID, saveIssueCmd)
    const editIssueCmd = new EditIssueCmd(issuePrismaRepository)
    this.register(EditIssueCmd.ID, editIssueCmd)

    // Analysis
    const analysisRepository = new AnalysisPrismaRepository(client)
    this.register(ANALYSIS_REPOSITORY, analysisRepository)
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

    // Holders
    const holderRepository = new HolderPrismaRepository(client)
    this.register(HOLDER_REPOSITORY, holderRepository)
    const getHoldersQry = new GetHoldersQry(holderRepository)
    this.register(GetHoldersQry.ID, getHoldersQry)
    const getHolderQry = new GetHolderQry(holderRepository)
    this.register(GetHolderQry.ID, getHolderQry)
    const createHolderCmd = new CreateHolderCmd(holderRepository)
    this.register(CreateHolderCmd.ID, createHolderCmd)
    const editHolderCmd = new EditHolderCmd(holderRepository)
    this.register(EditHolderCmd.ID, editHolderCmd)
    const deleteHolderCmd = new DeleteHolderCmd(holderRepository)
    this.register(DeleteHolderCmd.ID, deleteHolderCmd)

    // WaterZones
    const waterZonePrismaRepository = new WaterZonePrismaRepository(client)
    this.register(WATER_ZONE_REPOSITORY, waterZonePrismaRepository)
    const getWaterZonesQry = new GetWaterZonesQry(waterZonePrismaRepository)
    this.register(GetWaterZonesQry.ID, getWaterZonesQry)

    // Maintenance
    const maintenanceRepository = new MaintenancePrismaRepository(client)
    this.register(MAINTENANCE_REPOSITORY, maintenanceRepository)
    const getMaintenancesQry = new GetMaintenancesQry(maintenanceRepository)
    this.register(GetMaintenancesQry.ID, getMaintenancesQry)
    const getMaintenanceQry = new GetMaintenanceQry(maintenanceRepository)
    this.register(GetMaintenanceQry.ID, getMaintenanceQry)
    const saveMaintenanceCmd = new SaveMaintenanceCmd(maintenanceRepository)
    this.register(SaveMaintenanceCmd.ID, saveMaintenanceCmd)

    // Providers
    const providersRepository = new ProvidersPrismaRepository(client)
    this.register(PROVIDER_REPOSITORY, providersRepository)
    const getProvidersQry = new GetProvidersQry(providersRepository)
    this.register(GetProvidersQry.ID, getProvidersQry)
    const createProviderCmd = new CreateProviderCmd(providersRepository)
    this.register(CreateProviderCmd.ID, createProviderCmd)
    const getProviderQry = new GetProviderQry(providersRepository)
    this.register(GetProviderQry.ID, getProviderQry)
    const saveProviderCmd = new SaveProviderCmd(providersRepository)
    this.register(SaveProviderCmd.ID, saveProviderCmd)

    // Summary
    const getSummaryQry = new GetSummaryQry(
      analysisRepository,
      issuePrismaRepository,
      maintenanceRepository
    )
    this.register(GetSummaryQry.ID, getSummaryQry)

    // Registros Stats
    const getRegistrosStatsQry = new GetRegistrosStatsQry(client)
    this.register(GetRegistrosStatsQry.ID, getRegistrosStatsQry)

    // Storage and File Upload Services
    const r2Adapter = new CloudflareR2Adapter({
      accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID!,
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL!
    })
    this.register(STORAGE_SERVICE, r2Adapter)

    const fileRepository = new FilePrismaRepository(client)
    const fileUploadService = new FileUploadService(r2Adapter, fileRepository)
    this.register(FILE_UPLOAD_SERVICE, fileUploadService)

    // Create Water Meter Reading Command
    const createWaterMeterReadingCmd = new CreateWaterMeterReadingCmd(
      waterMeterReadingPrismaRepository,
      fileUploadService,
      waterMeterPrismaRepository
    )
    this.register(CreateWaterMeterReadingCmd.ID, createWaterMeterReadingCmd)

    const deleteWaterMeterReadingCmd = new DeleteWaterMeterReadingCmd(
      waterMeterReadingPrismaRepository
    )
    this.register(DeleteWaterMeterReadingCmd.ID, deleteWaterMeterReadingCmd)

    const getIssueByIdQry = new GetIssueByIdQry(issuePrismaRepository)
    this.register(GetIssueByIdQry.ID, getIssueByIdQry)

    const getIssuesQry = new GetIssuesQry(issuePrismaRepository)
    this.register(GetIssuesQry.ID, getIssuesQry)

    // User commands
    const getUsersQry = new GetUsersQry(userPrismaRepository)
    this.register(GetUsersQry.ID, getUsersQry)

    const createUserCmd = new CreateUserCmd(userPrismaRepository)
    this.register(CreateUserCmd.ID, createUserCmd)

    const deleteUserCmd = new DeleteUserCmd(userPrismaRepository)
    this.register(DeleteUserCmd.ID, deleteUserCmd)

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
