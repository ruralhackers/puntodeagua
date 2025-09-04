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
  STORAGE_SERVICE,
  USER_REPOSITORY,
  WATER_METER_READING_REPOSITORY,
  WATER_METER_REPOSITORY,
  WATER_REPOSITORY,
  WATER_ZONE_REPOSITORY
} from './core/di/injection-tokens'
import { CreateAnalysisCmd } from './features/analysis/application/create-analysis.cmd'
import { EditAnalysisCmd } from './features/analysis/application/edit-analysis.cmd'
import { GetAnalysesQry } from './features/analysis/application/get-analyses.qry'
import { GetAnalysisQry } from './features/analysis/application/get-analysis.qry'
import { AnalysisPrismaRepository } from './features/analysis/infrastructure/analysis.prisma-repository'
import { AuthenticateUserCmd } from './features/auth/application/authenticate-user.cmd'
import { UserPrismaRepository } from './features/auth/infrastructure/user.prisma-repository'
import { GetIssueByIdQry } from './features/issue/application/get-issue-by-id.qry'
import { SaveIssueCmd } from './features/issue/application/save-issue.cmd'
import { IssuePrismaRepository } from './features/issue/infrastructure/issue.prisma-repository'
import { GetWaterMeterQry } from './features/water-meter/application/get-water-meter.qry'
import { GetWaterMetersQry } from './features/water-meter/application/get-water-meters.qry'
import { CreateWaterMeterReadingCmd } from './features/water-meter-reading/application/create-water-meter-reading.cmd'
import { GetWaterMeterReadingsQry } from './features/water-meter-reading/application/get-water-meter-readings.qry'
import { WaterMeterReadingPrismaRepository } from './features/water-meter-reading/infrastructure/water-meter-reading.prisma-repository'
import { GetWaterPointsQry } from './features/water-point/application/get-water-points.qry'
import { WaterMeterPrismaRepository } from './features/water-point/infrastructure/water-meter.prisma-repository'
import { WaterPointPrismaRepository } from './features/water-point/infrastructure/water-point.prisma-repository'
import { GetWaterZonesQry } from './features/water-zone/application/get-water-zones.qry'
import { WaterZonePrismaRepository } from './features/water-zone/infrastructure/water-zone.prisma-repository'
import { FileUploadService } from './infrastructure/file-upload/file-upload.service'
import { CloudflareR2Adapter } from './infrastructure/storage/cloudflare-r2-adapter'

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

    const getWaterMeterQry = new GetWaterMeterQry(waterMeterPrismaRepository)
    this.register(GetWaterMeterQry.ID, getWaterMeterQry)

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
    const getAnalysisQry = new GetAnalysisQry(analysisRepository)
    this.register(GetAnalysisQry.ID, getAnalysisQry)
    const createAnalysisCmd = new CreateAnalysisCmd(analysisRepository)
    this.register(CreateAnalysisCmd.ID, createAnalysisCmd)
    const editAnalysisCmd = new EditAnalysisCmd(analysisRepository)
    this.register(EditAnalysisCmd.ID, editAnalysisCmd)

    // WaterZones
    const waterZonePrismaRepository = new WaterZonePrismaRepository(client)
    this.register(WATER_ZONE_REPOSITORY, waterZonePrismaRepository)

    const getWaterZonesQry = new GetWaterZonesQry(waterZonePrismaRepository)
    this.register(GetWaterZonesQry.ID, getWaterZonesQry)

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

    const getIssueByIdQry = new GetIssueByIdQry(issuePrismaRepository)
    this.register(GetIssueByIdQry.ID, getIssueByIdQry)

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
