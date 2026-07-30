import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import type { CommunityZoneRepository, WaterPointRepository } from '@pda/community'
import { CommunityZone } from '@pda/community/domain'
import { DuplicateConnectionNumberError } from '@pda/community/domain/errors/water-point-errors'
import type { WaterMeterReadingCreator } from '../application/water-meter-reading-creator.service'
import { WaterPointOnboarding } from '../application/water-point-onboarding.service'
import { WaterAccount } from '../domain'
import type { WaterAccountRepository } from '../domain/repositories/water-account.repository'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'
import {
  createMockCommunityZoneRepository,
  createMockWaterAccountRepository,
  createMockWaterMeterRepository,
  createMockWaterPointRepository
} from './helpers/mocks'

describe('WaterPointOnboarding', () => {
  let service: WaterPointOnboarding
  let mockZoneRepo: CommunityZoneRepository
  let mockWaterPointRepo: WaterPointRepository
  let mockAccountRepo: WaterAccountRepository
  let mockMeterRepo: WaterMeterRepository
  let mockReadingCreator: WaterMeterReadingCreator

  const communityId = Id.generateUniqueId()
  const otherCommunityId = Id.generateUniqueId()
  const zoneId = Id.generateUniqueId()

  const zone = CommunityZone.fromDto({
    id: zoneId.toString(),
    name: 'Zona A',
    communityId: communityId.toString(),
    notes: ''
  })

  const baseParams = () => ({
    communityId,
    waterPoint: {
      name: 'Casa Nueva',
      location: 'Calle 1',
      connectionNumber: 'C99',
      communityZoneId: zoneId.toString(),
      fixedPopulation: 2,
      floatingPopulation: 1,
      cadastralReference: 'REF-001',
      notes: 'Notas',
      waterDepositIds: []
    },
    account: {
      name: 'Titular',
      nationalId: '12345678A',
      phone: '600000000',
      notes: 'Cuenta'
    },
    waterMeter: {
      name: 'Contador C99',
      measurementUnit: 'M3',
      isActive: true
    }
  })

  beforeEach(() => {
    mockZoneRepo = createMockCommunityZoneRepository()
    mockWaterPointRepo = createMockWaterPointRepository() as WaterPointRepository
    mockAccountRepo = createMockWaterAccountRepository()
    mockMeterRepo = createMockWaterMeterRepository()
    mockReadingCreator = {
      run: mock(() =>
        Promise.resolve({
          reading: { id: Id.generateUniqueId() }
        })
      )
    } as unknown as WaterMeterReadingCreator

    mockZoneRepo.findById = mock(() => Promise.resolve(zone))
    mockAccountRepo.findByNationalIdInCommunity = mock(() => Promise.resolve(undefined))
    mockAccountRepo.save = mock(() => Promise.resolve())
    mockAccountRepo.delete = mock(() => Promise.resolve())
    mockWaterPointRepo.save = mock(() => Promise.resolve())
    mockWaterPointRepo.delete = mock(() => Promise.resolve())
    mockMeterRepo.save = mock(() => Promise.resolve())
    mockMeterRepo.delete = mock(() => Promise.resolve())

    service = new WaterPointOnboarding(
      mockZoneRepo,
      mockWaterPointRepo,
      mockAccountRepo,
      mockMeterRepo,
      mockReadingCreator
    )
  })

  it('creates account, water point and meter', async () => {
    const result = await service.run(baseParams())

    expect(result.accountReused).toBe(false)
    expect(result.waterPointId).toBeTruthy()
    expect(result.waterAccountId).toBeTruthy()
    expect(result.waterMeterId).toBeTruthy()
    expect(mockAccountRepo.save).toHaveBeenCalledTimes(1)
    expect(mockWaterPointRepo.save).toHaveBeenCalledTimes(1)
    expect(mockMeterRepo.save).toHaveBeenCalledTimes(1)
    expect(mockReadingCreator.run).not.toHaveBeenCalled()
  })

  it('reuses account when nationalId exists in the same community', async () => {
    const existing = WaterAccount.fromDto({
      id: Id.generateUniqueId().toString(),
      name: 'Existing',
      nationalId: '12345678A'
    })
    mockAccountRepo.findByNationalIdInCommunity = mock(() => Promise.resolve(existing))

    const result = await service.run(baseParams())

    expect(result.accountReused).toBe(true)
    expect(result.waterAccountId).toBe(existing.id.toString())
    expect(mockAccountRepo.save).not.toHaveBeenCalled()
  })

  it('creates a new account when same nationalId exists only in another community', async () => {
    mockAccountRepo.findByNationalIdInCommunity = mock(() => Promise.resolve(undefined))

    const result = await service.run(baseParams())

    expect(result.accountReused).toBe(false)
    expect(mockAccountRepo.findByNationalIdInCommunity).toHaveBeenCalledWith(
      '12345678A',
      communityId
    )
    expect(mockAccountRepo.save).toHaveBeenCalledTimes(1)
  })

  it('rejects zone that does not belong to community', async () => {
    const foreignZone = CommunityZone.fromDto({
      id: zoneId.toString(),
      name: 'Zona B',
      communityId: otherCommunityId.toString(),
      notes: ''
    })
    mockZoneRepo.findById = mock(() => Promise.resolve(foreignZone))

    await expect(service.run(baseParams())).rejects.toThrow(
      'Community zone does not belong to this community'
    )
    expect(mockWaterPointRepo.save).not.toHaveBeenCalled()
  })

  it('rejects missing zone', async () => {
    mockZoneRepo.findById = mock(() => Promise.resolve(undefined))

    await expect(service.run(baseParams())).rejects.toThrow('Community zone not found')
  })

  it('propagates duplicate connection number and cleans up created account', async () => {
    mockWaterPointRepo.save = mock(() => Promise.reject(new DuplicateConnectionNumberError('C99')))

    await expect(service.run(baseParams())).rejects.toThrow(DuplicateConnectionNumberError)
    expect(mockAccountRepo.delete).toHaveBeenCalledTimes(1)
    expect(mockMeterRepo.save).not.toHaveBeenCalled()
  })

  it('creates optional initial reading', async () => {
    const result = await service.run({
      ...baseParams(),
      initialReading: {
        reading: '12.5',
        date: new Date('2026-01-01')
      }
    })

    expect(result.initialReadingId).toBeTruthy()
    expect(mockReadingCreator.run).toHaveBeenCalledTimes(1)
  })

  it('rolls back meter and point when initial reading fails', async () => {
    mockReadingCreator.run = mock(() => Promise.reject(new Error('Invalid reading')))

    await expect(
      service.run({
        ...baseParams(),
        initialReading: { reading: 'bad' }
      })
    ).rejects.toThrow('Invalid reading')

    expect(mockMeterRepo.delete).toHaveBeenCalledTimes(1)
    expect(mockWaterPointRepo.delete).toHaveBeenCalledTimes(1)
    expect(mockAccountRepo.delete).toHaveBeenCalledTimes(1)
  })
})
