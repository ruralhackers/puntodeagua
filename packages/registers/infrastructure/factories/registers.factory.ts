import { client as prisma } from '@pda/database'
import { AnalysisCreator } from '../../application/analysis-creator.service'
import { IncidentCreator } from '../../application/incident-creator.service'
import { IncidentUpdater } from '../../application/incident-updater.service'
import { AnalysisPrismaRepository } from '../repositories/analysis.prisma-repository'
import { IncidentPrismaRepository } from '../repositories/incident.prisma-repository'

export class RegistersFactory {
  private static analysisPrismaRepositoryInstance: AnalysisPrismaRepository
  private static incidentPrismaRepositoryInstance: IncidentPrismaRepository

  // SERVICES
  static analysisCreatorService() {
    return new AnalysisCreator(RegistersFactory.analysisPrismaRepository())
  }

  static incidentCreatorService() {
    return new IncidentCreator(RegistersFactory.incidentPrismaRepository())
  }

  static incidentUpdaterService() {
    return new IncidentUpdater(RegistersFactory.incidentPrismaRepository())
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
}
