import type { Command, Id } from 'core'
import type { HolderRepository } from 'features'

export class DeleteHolderCmd implements Command<Id> {
  static readonly ID = 'DeleteHolderCmd'

  constructor(private readonly repo: HolderRepository) {}

  async handle(id: Id): Promise<void> {
    return this.repo.delete(id)
  }
}
