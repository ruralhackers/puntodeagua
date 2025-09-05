import type { Command, Id } from 'core'
import type { WaterPointRepository } from 'features'

export class DeleteWaterPointCmd implements Command<Id> {
  static readonly ID = 'DeleteWaterPointCmd'

  constructor(private readonly repo: WaterPointRepository) {}

  async handle(id: Id): Promise<void> {
    return this.repo.delete(id)
  }
}
