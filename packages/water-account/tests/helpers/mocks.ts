import { mock } from 'bun:test'
import type { CommunityRepository, CommunityZoneRepository } from '@pda/community'
import type { FileStorageRepository } from '@pda/storage'
import type { FileDeleterService } from '../../application/file-deleter.service'
import type { FileUploaderService } from '../../application/file-uploader.service'
import type { WaterMeterLastReadingUpdater } from '../../application/water-meter-last-reading-updater.service'
import type { WaterAccountRepository } from '../../domain/repositories/water-account.repository'
import type { WaterMeterRepository } from '../../domain/repositories/water-meter.repository'
import type { WaterMeterReadingRepository } from '../../domain/repositories/water-meter-reading.repository'
import type { WaterMeterReadingImageRepository } from '../../domain/repositories/water-meter-reading-image.repository'

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

export const createMockWaterMeterReadingImageRepository = (): WaterMeterReadingImageRepository => {
  return {
    findById: mock(),
    findByWaterMeterReadingId: mock(),
    save: mock(),
    delete: mock()
  } as unknown as WaterMeterReadingImageRepository
}

export const createMockFileStorageRepository = (): FileStorageRepository => {
  return {
    upload: mock(),
    delete: mock(),
    getUrl: mock(),
    exists: mock()
  } as unknown as FileStorageRepository
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

export const createMockWaterAccountRepository = (): WaterAccountRepository => {
  return {
    findById: mock(),
    findAll: mock(),
    save: mock(),
    delete: mock(),
    findForTable: mock()
  } as unknown as WaterAccountRepository
}
