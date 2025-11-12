import { Id } from '@pda/common/domain'
import type { ProviderUpdateDto } from '../domain/entities/provider.dto'
import { ProviderNotFoundError } from '../domain/errors/provider-errors'
import type { ProviderRepository } from '../domain/repositories/provider.repository'

export class ProviderUpdater {
  constructor(private readonly providerRepository: ProviderRepository) {}

  async run(params: { id: Id; updatedProviderData: ProviderUpdateDto }) {
    const { id, updatedProviderData } = params

    const provider = await this.providerRepository.findById(id)
    if (!provider) {
      throw new ProviderNotFoundError()
    }

    provider.update(updatedProviderData)
    await this.providerRepository.save(provider)

    return provider
  }
}

