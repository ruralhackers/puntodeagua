import { mock } from 'bun:test'
import type { ProviderRepository } from '../../domain/repositories/provider.repository'

export const createMockProviderRepository = (): ProviderRepository => {
  return {
    findById: mock(),
    save: mock(),
    findAll: mock(),
    delete: mock(),
    findForTable: mock(),
    findByCommunityId: mock()
  } as unknown as ProviderRepository
}

