import { client as prisma } from '@pda/database'
import { AnalysisCreator } from '../../application/analysis-creator.service'
import { AnalysisPrismaRepository } from '../repositories/analysis.prisma-repository'

export class RegistersFactory {
  private static analysisPrismaRepositoryInstance: AnalysisPrismaRepository

  // SERVICES
  static analysisCreatorService() {
    return new AnalysisCreator(RegistersFactory.analysisPrismaRepository())
  }

  static analysisPrismaRepository() {
    if (!RegistersFactory.analysisPrismaRepositoryInstance) {
      RegistersFactory.analysisPrismaRepositoryInstance = new AnalysisPrismaRepository(prisma)
    }
    return RegistersFactory.analysisPrismaRepositoryInstance
  }
}
