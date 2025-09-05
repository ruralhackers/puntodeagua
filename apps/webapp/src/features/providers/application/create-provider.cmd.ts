import type { Command } from 'core'
import type { ProviderSchema } from 'features/providers/schemas/provider.schema'
// no-op
import type { ProvidersCreateRepository } from '../infrastructure/providers.api-rest-repository'

export class CreateProviderCmd implements Command<Omit<ProviderSchema, 'id'>> {
  static readonly ID = 'CreateProviderCmd'

  constructor(private readonly providerRepository: ProvidersCreateRepository) {}

  async handle(data: Omit<ProviderSchema, 'id'>): Promise<void> {
    await this.providerRepository.create(data)
  }
}
