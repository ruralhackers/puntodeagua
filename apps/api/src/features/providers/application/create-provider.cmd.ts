import type { Command } from 'core'
import type { ProviderRepository } from 'features'
import { Provider } from 'features'
import type { ProviderSchema } from 'features/providers/schemas/provider.schema'

export class CreateProviderCmd implements Command<Omit<ProviderSchema, 'id'>> {
  static readonly ID = 'CreateProviderCmd'

  constructor(private readonly providerRepository: ProviderRepository) {}

  async handle(data: Omit<ProviderSchema, 'id'>): Promise<void> {
    const provider = Provider.create(data)
    await this.providerRepository.save(provider)
  }
}
