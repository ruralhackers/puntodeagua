import type { Query } from 'core'
import type { GetHoldersFiltersDto, Holder, HolderRepository } from 'features'

export class GetHoldersQry implements Query<Holder[], GetHoldersFiltersDto> {
  static readonly ID = 'GetHoldersQry'

  constructor(private readonly holderRepository: HolderRepository) {}

  async handle(filters: GetHoldersFiltersDto = {}): Promise<Holder[]> {
    const holders = await this.holderRepository.findWithFilters(filters)
    return holders
  }
}
