import type { Command } from 'core'
import { Provider } from 'features'
import type { ProviderRepository } from 'features/providers/repositories/provider.repository'
import type { ProviderSchema } from 'features/providers/schemas/provider.schema'

export class EditProviderCmd implements Command<ProviderSchema> {
  static readonly ID = 'EditProviderCmd'

  constructor(private readonly providerRepository: ProviderRepository) {}

  async handle(input: ProviderSchema): Promise<void> {
    const provider = Provider.fromDto(input)
    await this.providerRepository.save(provider)
  }
}
