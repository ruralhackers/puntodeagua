import type { Id, Query } from 'core'
import type { Provider } from 'features'
import type { ProviderRepository } from 'features/providers/repositories/provider.repository'

export class GetProviderQry implements Query<Provider | undefined, Id> {
  static readonly ID = 'GetProviderQry'

  constructor(private readonly providerRepository: ProviderRepository) {}

  async handle(id: Id): Promise<Provider | undefined> {
    return this.providerRepository.findById(id)
  }
}
