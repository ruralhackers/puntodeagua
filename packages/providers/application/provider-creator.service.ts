import type { Provider } from '../domain/entities/provider'
import type { ProviderRepository } from '../domain/repositories/provider.repository'

export class ProviderCreator {
  constructor(private readonly providerRepository: ProviderRepository) {}

  async run(params: { provider: Provider }) {
    const { provider } = params
    await this.providerRepository.save(provider)
    return provider
  }
}

