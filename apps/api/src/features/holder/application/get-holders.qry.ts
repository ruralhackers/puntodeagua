import type { Query } from 'core'
import type { GetHoldersFiltersDto, Holder, HolderRepository } from 'features'

export class GetHoldersQry implements Query<Holder[], GetHoldersFiltersDto> {
  static readonly ID = 'GetHoldersQry'
  constructor(private readonly repo: HolderRepository) {}

  async handle(filters: GetHoldersFiltersDto = {}): Promise<Holder[]> {
    return this.repo.findWithFilters(filters)
  }
}
