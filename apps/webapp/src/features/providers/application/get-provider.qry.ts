import { Id, type Query } from 'core'
import type { IdSchema } from 'core/types/id.schema'
import type { Provider } from 'features'
import type { ProviderRepository } from 'features/providers/repositories/provider.repository'

export class GetProviderQry implements Query<Provider | undefined, IdSchema> {
  static readonly ID = 'GetProviderQry'

  constructor(private readonly providerRepository: ProviderRepository) {}

  async handle(id: IdSchema): Promise<Provider | undefined> {
    return this.providerRepository.findById(Id.create(id))
  }
}
