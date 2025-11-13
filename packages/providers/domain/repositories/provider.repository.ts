import type {
  Deletable,
  FindableAll,
  FindableByCommunityId,
  FindableById,
  FindableForTable,
  Id,
  Savable
} from '@pda/common/domain'
import type { Provider } from '../entities/provider'

export interface ProviderRepository
  extends FindableAll<Provider>,
    FindableById<Provider>,
    FindableByCommunityId<Provider>,
    FindableForTable<Provider>,
    Savable<Provider>,
    Deletable {
  findById(id: Id): Promise<Provider | undefined>
  findAll(): Promise<Provider[]>
  findByCommunityId(communityId: Id): Promise<Provider[]>
  save(provider: Provider): Promise<void>
  delete(id: Id): Promise<void>
}
