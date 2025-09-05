import type { Query } from 'core'
import type { Holder, HolderRepository } from 'features'

export class GetHoldersQry implements Query<Holder[]> {
  static readonly ID = 'GetHoldersQry'
  constructor(private readonly repo: HolderRepository) {}

  async handle(): Promise<Holder[]> {
    return this.repo.findAll()
  }
}
