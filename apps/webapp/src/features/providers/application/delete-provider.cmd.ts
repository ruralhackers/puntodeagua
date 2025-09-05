import { type Command, Id } from 'core'
import type { IdSchema } from 'core/types/id.schema'
import type { ProviderRepository } from 'features'

export class DeleteProviderCmd implements Command<IdSchema> {
  static readonly ID = 'DeleteProviderCmd'

  constructor(private readonly providerRepository: ProviderRepository) {}

  async handle(id: IdSchema): Promise<void> {
    return this.providerRepository.delete(Id.create(id))
  }
}
