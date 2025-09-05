import type { Deletable, FindableAll, FindableById, Savable } from 'core'
import type { Provider } from '../entities/provider'

export interface ProviderRepository
  extends Savable<Provider>,
    Deletable<Provider>,
    FindableById<Provider>,
    FindableAll<Provider> {}
