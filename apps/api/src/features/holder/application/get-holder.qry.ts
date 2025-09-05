import type { Id, Query } from 'core'
import type { Holder, HolderRepository } from 'features'

export class GetHolderQry implements Query<Holder | undefined, Id> {
  static readonly ID = 'GetHolderQry'
  constructor(private readonly repo: HolderRepository) {}

  async handle(id: Id): Promise<Holder | undefined> {
    return this.repo.findById(id)
  }
}
