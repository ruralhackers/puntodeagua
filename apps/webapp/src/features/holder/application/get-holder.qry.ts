import type { Query } from 'core'
import { Id } from 'core'
import type { Holder, HolderRepository } from 'features'

interface GetHolderParams {
  id: string
}

export class GetHolderQry implements Query<Holder | undefined, GetHolderParams> {
  static readonly ID = 'GetHolderQry'

  constructor(private readonly holderRepository: HolderRepository) {}

  async handle(params: GetHolderParams): Promise<Holder | undefined> {
    const id = Id.create(params.id)
    const holder = await this.holderRepository.findById(id)
    return holder
  }
}
