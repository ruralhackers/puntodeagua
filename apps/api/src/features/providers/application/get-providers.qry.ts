import type { Query } from 'core'
import type { Provider, ProviderRepository } from 'features'

export class GetProvidersQry implements Query<Provider[]> {
  static readonly ID = 'GetProvidersQry'
  constructor(private readonly providerRepository: ProviderRepository) {}

  async handle(): Promise<Provider[]> {
    return this.providerRepository.findAll()
  }
}
