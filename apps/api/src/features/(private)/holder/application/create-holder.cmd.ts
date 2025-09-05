import type { Command } from 'core'
import { Holder, type HolderRepository } from 'features'
import type { HolderSchema } from 'features/schemas/holder.schema'

export class CreateHolderCmd implements Command<Omit<HolderSchema, 'id'>> {
  static readonly ID = 'CreateHolderCmd'

  constructor(private readonly repo: HolderRepository) {}

  async handle(dto: Omit<HolderSchema, 'id'>): Promise<void> {
    const entity = Holder.create(dto)
    return this.repo.save(entity)
  }
}
