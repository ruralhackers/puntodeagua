import type { Command, Id } from 'core'
import type { ProviderRepository } from 'features'

export class DeleteProviderCmd implements Command<Id> {
  static readonly ID = 'DeleteProviderCmd'

  constructor(private readonly providerRepository: ProviderRepository) {}

  async handle(id: Id): Promise<void> {
    return this.providerRepository.delete(id)
  }
}
