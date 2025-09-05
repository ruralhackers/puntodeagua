import type { Command } from 'core'
import { Holder, type HolderRepository } from 'features'
import type { HolderSchema } from 'features/schemas/holder.schema'

export class EditHolderCmd implements Command<HolderSchema> {
  static readonly ID = 'EditHolderCmd'

  constructor(private readonly repo: HolderRepository) {}

  async handle(dto: HolderSchema): Promise<void> {
    const entity = Holder.fromDto(dto)
    return this.repo.save(entity)
  }
}
