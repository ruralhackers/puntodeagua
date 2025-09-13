import type { Deletable, FindableAll, FindableById, Savable } from 'core'
import type { GetHoldersFiltersDto } from '../../schemas/get-holders-filters.schema'
import type { Holder } from '../entities/holder'

export interface HolderRepository
  extends Savable<Holder>,
    Deletable<Holder>,
    FindableById<Holder>,
    FindableAll<Holder> {
  findWithFilters(filters: GetHoldersFiltersDto): Promise<Holder[]>
}
