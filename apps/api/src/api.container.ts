import { CoreContainer } from 'core'
import { client } from 'database'
import {
  USER_REPOSITORY,
  WATER_METER_READING_REPOSITORY,
  WATER_REPOSITORY
} from './core/di/injection-tokens'
import { AuthenticateUserCmd } from './features/auth/application/authenticate-user.cmd'
import { UserPrismaRepository } from './features/auth/infrastructure/user.prisma-repository'
import {
  FileStorageService,
  LocalFileStorageService
} from './features/files/infrastructure/file-storage.service'
import { GetWaterMeterReadingsQry } from './features/water-meter-reading/application/get-water-meter-readings.qry'
import { WaterMeterReadingPrismaRepository } from './features/water-meter-reading/infrastructure/water-meter-reading.prisma-repository'
import { CreateWaterMeterReadingCmd } from './features/water-point/application/create-water-meter-reading.cmd'
import { GetWaterPointsQry } from './features/water-point/application/get-water-points.qry'
import { WaterPointPrismaRepository } from './features/water-point/infrastructure/water-point.prisma-repository'

export class ApiContainer extends CoreContainer {
  protected override registerInstances(): void {
    super.registerInstances()

    const waterPointPrismaRepository = new WaterPointPrismaRepository(client)
    this.register(WATER_REPOSITORY, waterPointPrismaRepository)

    const waterMeterReadingPrismaRepository = new WaterMeterReadingPrismaRepository(client)
    this.register(WATER_METER_READING_REPOSITORY, waterMeterReadingPrismaRepository)

    const getWaterPointsQry = new GetWaterPointsQry(waterPointPrismaRepository)
    this.register(GetWaterPointsQry.ID, getWaterPointsQry)

    const userPrismaRepository = new UserPrismaRepository(client)
    this.register(USER_REPOSITORY, userPrismaRepository)

    // Note: We register the command without JWT function as it will be injected at runtime
    const authenticateUserCmd = new AuthenticateUserCmd(userPrismaRepository, async () => {
      throw new Error('JWT function not injected')
    })
    this.register(AuthenticateUserCmd.ID, authenticateUserCmd)

    const fileStorageService = new LocalFileStorageService()
    this.register('FileStorageService', fileStorageService)

    const createWaterMeterReadingCmd = new CreateWaterMeterReadingCmd(
      waterMeterReadingPrismaRepository,
      fileStorageService
    )
    this.register(CreateWaterMeterReadingCmd.ID, createWaterMeterReadingCmd)

    const getWaterMeterReadingsQry = new GetWaterMeterReadingsQry(waterMeterReadingPrismaRepository)
    this.register(GetWaterMeterReadingsQry.ID, getWaterMeterReadingsQry)
  }
}

export const apiContainer = new ApiContainer()
