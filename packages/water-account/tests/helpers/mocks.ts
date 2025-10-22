import { mock } from 'bun:test'
import type { CommunityRepository, CommunityZoneRepository } from '@pda/community'
import type { WaterMeterLastReadingUpdater } from '../../application/water-meter-last-reading-updater.service'
import type { WaterMeterRepository } from '../../domain/repositories/water-meter.repository'
import type { WaterMeterReadingRepository } from '../../domain/repositories/water-meter-reading.repository'

export const createMockWaterMeterRepository = (): WaterMeterRepository => {
  return {
    findById: mock(),
    save: mock(),
    findAll: mock(),
    delete: mock(),
    findForTable: mock(),
    findByWaterPointId: mock(),
    findActiveByCommunityZonesIdOrderedByLastReading: mock()
  } as unknown as WaterMeterRepository
}

export const createMockWaterMeterReadingRepository = (): WaterMeterReadingRepository => {
  return {
    findById: mock(),
    findLastReading: mock(),
    save: mock(),
    findAll: mock(),
    delete: mock(),
    findForTable: mock()
  } as unknown as WaterMeterReadingRepository
}

export const createMockWaterMeterLastReadingUpdater = (): WaterMeterLastReadingUpdater => {
  return {
    run: mock()
  } as unknown as WaterMeterLastReadingUpdater
}

export const createMockCommunityRepository = (): CommunityRepository => {
  return {
    findById: mock(),
    save: mock(),
    findAll: mock(),
    delete: mock(),
    findForTable: mock()
  } as unknown as CommunityRepository
}

export const createMockCommunityZoneRepository = (): CommunityZoneRepository => {
  return {
    findById: mock(),
    save: mock(),
    findAll: mock(),
    delete: mock(),
    findForTable: mock()
  } as unknown as CommunityZoneRepository
}
