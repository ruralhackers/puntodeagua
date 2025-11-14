import { mock } from 'bun:test'
import type { FileDeleterService, FileUploaderService } from '@pda/storage'
import type { IncidentRepository } from '../../domain/repositories/incident.repository'
import type { IncidentImageRepository } from '../../domain/repositories/incident-image.repository'

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

export const createMockIncidentImageRepository = (): IncidentImageRepository => {
  return {
    findById: mock(),
    findByIncidentId: mock(),
    findByEntityId: mock(),
    save: mock(),
    delete: mock(),
    deleteAllByIncidentId: mock()
  } as unknown as IncidentImageRepository
}

export const createMockFileUploaderService = (): FileUploaderService => {
  return {
    run: mock()
  } as unknown as FileUploaderService
}

export const createMockFileDeleterService = (): FileDeleterService => {
  return {
    run: mock()
  } as unknown as FileDeleterService
}
