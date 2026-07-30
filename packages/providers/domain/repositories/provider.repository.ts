import type {
  Deletable,
  FindableAll,
  FindableByCommunityId,
  FindableById,
  FindableForTable,
  Savable
} from '@pda/common/domain'
import type { Provider } from '../entities/provider'

export interface ProviderRepository
  extends FindableAll<Provider>,
    FindableById<Provider>,
    FindableByCommunityId<Provider>,
    FindableForTable<Provider>,
    Savable<Provider>,
    Deletable<Provider> {}
