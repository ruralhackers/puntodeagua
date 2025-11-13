import { Id } from '@pda/common/domain'
import { ProviderNotFoundError } from '../domain/errors/provider-errors'
import type { ProviderRepository } from '../domain/repositories/provider.repository'

export class ProviderDeleter {
  constructor(private readonly providerRepository: ProviderRepository) {}

  async run(params: { id: Id }) {
    const { id } = params

    const provider = await this.providerRepository.findById(id)
    if (!provider) {
      throw new ProviderNotFoundError()
    }

    await this.providerRepository.delete(id)
  }
}
