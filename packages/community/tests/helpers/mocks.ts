import { mock } from 'bun:test'
import type { WaterDepositRepository } from '../../domain/repositories/water-deposit.repository'
import type { WaterPointRepository } from '../../domain/repositories/water-point.repository'

export const createMockWaterDepositRepository = (): WaterDepositRepository => {
  return {
    findById: mock(),
    save: mock(),
    findAll: mock(),
    delete: mock(),
    findForTable: mock(),
    findByCommunityId: mock(),
    findByIds: mock()
  } as unknown as WaterDepositRepository
}

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
