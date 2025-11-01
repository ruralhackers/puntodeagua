import { mock } from 'bun:test'
import type { WaterPointRepository } from '../../domain/repositories/water-point.repository'

export const createMockWaterPointRepository = (): WaterPointRepository => {
  return {
    findById: mock(),
    save: mock(),
    findAll: mock(),
    delete: mock(),
    findForTable: mock(),
    findByCommunityZonesId: mock(),
    findByCommunityZonesIdWithAccount: mock(),
    findByCommunityIdWithAccount: mock()
  } as unknown as WaterPointRepository
}
