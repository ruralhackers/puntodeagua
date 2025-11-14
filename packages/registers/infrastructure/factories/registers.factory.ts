import { client as prisma } from '@pda/database'
import {
  FileDeleterService,
  FileEntityType,
  FileUploaderService,
  R2FileStorageRepository
} from '@pda/storage'
import { AnalysisCreator } from '../../application/analysis-creator.service'
import { IncidentCreator } from '../../application/incident-creator.service'
import { IncidentUpdater } from '../../application/incident-updater.service'
import { AnalysisPrismaRepository } from '../repositories/analysis.prisma-repository'
import { IncidentPrismaRepository } from '../repositories/incident.prisma-repository'
import { IncidentImagePrismaRepository } from '../repositories/incident-image.prisma-repository'

export class RegistersFactory {
  private static analysisPrismaRepositoryInstance: AnalysisPrismaRepository
  private static incidentPrismaRepositoryInstance: IncidentPrismaRepository
  private static incidentImagePrismaRepositoryInstance: IncidentImagePrismaRepository
  private static r2FileStorageRepositoryInstance: R2FileStorageRepository

  // SERVICES
  static analysisCreatorService() {
    return new AnalysisCreator(RegistersFactory.analysisPrismaRepository())
  }

  static incidentCreatorService() {
    return new IncidentCreator(
      RegistersFactory.incidentPrismaRepository(),
      RegistersFactory.fileUploaderService()
    )
  }

  static incidentUpdaterService() {
    return new IncidentUpdater(
      RegistersFactory.incidentPrismaRepository(),
      RegistersFactory.fileUploaderService(),
      RegistersFactory.fileDeleterService()
    )
  }

  static fileUploaderService() {
    const repositoryMap = new Map()
    repositoryMap.set(FileEntityType.INCIDENT, RegistersFactory.incidentImagePrismaRepository())

    return new FileUploaderService(RegistersFactory.r2FileStorageRepository(), repositoryMap)
  }

  static fileDeleterService() {
    const repositoryMap = new Map()
    repositoryMap.set(FileEntityType.INCIDENT, RegistersFactory.incidentImagePrismaRepository())

    return new FileDeleterService(RegistersFactory.r2FileStorageRepository(), repositoryMap)
  }

  static analysisPrismaRepository() {
    if (!RegistersFactory.analysisPrismaRepositoryInstance) {
      RegistersFactory.analysisPrismaRepositoryInstance = new AnalysisPrismaRepository(prisma)
    }
    return RegistersFactory.analysisPrismaRepositoryInstance
  }

  static incidentPrismaRepository() {
    if (!RegistersFactory.incidentPrismaRepositoryInstance) {
      RegistersFactory.incidentPrismaRepositoryInstance = new IncidentPrismaRepository(prisma)
    }
    return RegistersFactory.incidentPrismaRepositoryInstance
  }

  static incidentImagePrismaRepository() {
    if (!RegistersFactory.incidentImagePrismaRepositoryInstance) {
      RegistersFactory.incidentImagePrismaRepositoryInstance = new IncidentImagePrismaRepository(
        prisma
      )
    }
    return RegistersFactory.incidentImagePrismaRepositoryInstance
  }

  static r2FileStorageRepository() {
    if (!RegistersFactory.r2FileStorageRepositoryInstance) {
      RegistersFactory.r2FileStorageRepositoryInstance = new R2FileStorageRepository({
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
        bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
        publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || ''
      })
    }
    return RegistersFactory.r2FileStorageRepositoryInstance
  }
}
