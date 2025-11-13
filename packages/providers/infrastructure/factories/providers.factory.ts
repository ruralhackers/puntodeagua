import { client as prisma } from '@pda/database'
import { ProviderCreator } from '../../application/provider-creator.service'
import { ProviderUpdater } from '../../application/provider-updater.service'
import { ProviderPrismaRepository } from '../repositories/provider.prisma-repository'

export class ProvidersFactory {
  private static providerPrismaRepositoryInstance: ProviderPrismaRepository

  // SERVICES
  static providerCreatorService() {
    return new ProviderCreator(ProvidersFactory.providerPrismaRepository())
  }

  static providerUpdaterService() {
    return new ProviderUpdater(ProvidersFactory.providerPrismaRepository())
  }

  static providerPrismaRepository() {
    if (!ProvidersFactory.providerPrismaRepositoryInstance) {
      ProvidersFactory.providerPrismaRepositoryInstance = new ProviderPrismaRepository(prisma)
    }
    return ProvidersFactory.providerPrismaRepositoryInstance
  }
}
