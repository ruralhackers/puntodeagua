import type { Command } from 'core'
import { Provider, type ProviderRepository, type ProviderSchema } from 'features'

export class SaveProviderCmd implements Command<ProviderSchema> {
  static readonly ID = 'SaveProviderCmd'

  constructor(private readonly providerRepository: ProviderRepository) {}

  async handle(input: ProviderSchema): Promise<void> {
    const provider = Provider.fromDto(input)
    await this.providerRepository.save(provider)
  }
}
