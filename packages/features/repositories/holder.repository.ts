import type { Deletable, FindableAll, FindableById, Savable } from 'core'
import type { Holder } from '../entities/holder'
import type { GetHoldersFiltersDto } from '../schemas/get-holders-filters.schema'

export interface HolderRepository
  extends Savable<Holder>,
    Deletable<Holder>,
    FindableById<Holder>,
    FindableAll<Holder> {
  findWithFilters(filters: GetHoldersFiltersDto): Promise<Holder[]>
}
