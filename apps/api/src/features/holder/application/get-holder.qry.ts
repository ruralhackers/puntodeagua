import { Id, type Query } from 'core'
import type { Holder, HolderRepository } from 'features'

interface GetHolderParams {
  id: string
  communityId?: string
}

export class GetHolderQry implements Query<Holder | undefined, GetHolderParams> {
  static readonly ID = 'GetHolderQry'
  constructor(private readonly repo: HolderRepository) {}

  async handle(params: GetHolderParams): Promise<Holder | undefined> {
    const id = Id.create(params.id)
    return this.repo.findById(id)
  }
}
