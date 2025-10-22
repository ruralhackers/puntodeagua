import { mock } from 'bun:test'
import type { IncidentRepository } from '../../domain/repositories/incident.repository'

export const createMockIncidentRepository = (): IncidentRepository => {
  return {
    findById: mock(),
    save: mock(),
    findAll: mock(),
    delete: mock(),
    findForTable: mock(),
    findByCommunityId: mock(),
    findByFilters: mock()
  } as unknown as IncidentRepository
}
