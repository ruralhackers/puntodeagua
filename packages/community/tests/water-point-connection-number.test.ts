import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import type { client as PrismaClient } from '@pda/database'
import { WaterPoint } from '../domain/entities/water-point'
import { DuplicateConnectionNumberError } from '../domain/errors/water-point-errors'
import { WaterPointPrismaRepository } from '../infrastructure/repositories/water-point.prisma-repository'

function createWaterPoint(overrides: Partial<ReturnType<WaterPoint['toDto']>> = {}) {
  return WaterPoint.fromDto({
    id: Id.generateUniqueId().toString(),
    name: 'Test House',
    location: '40.4168,-3.7038',
    fixedPopulation: 4,
    floatingPopulation: 2,
    cadastralReference: 'TEST-001',
    communityZoneId: Id.generateUniqueId().toString(),
    waterDepositIds: [],
    connectionNumber: 'C35',
    ...overrides
  })
}

function createMockDb(options: { communityId?: string; duplicateId?: string | null }) {
  const upsert = mock(() => Promise.resolve({}))
  const findFirst = mock(() =>
    Promise.resolve(options.duplicateId ? { id: options.duplicateId } : null)
  )
  const findUniqueZone = mock(() =>
    Promise.resolve(options.communityId ? { communityId: options.communityId } : null)
  )

  return {
    waterPoint: {
      findMany: mock(() => Promise.resolve([])),
      findUnique: mock(() => Promise.resolve(null)),
      findFirst,
      upsert,
      delete: mock(() => Promise.resolve({}))
    },
    communityZone: {
      findUnique: findUniqueZone
    },
    upsert,
    findFirst,
    findUniqueZone
  } as unknown as PrismaClient & {
    upsert: typeof upsert
    findFirst: typeof findFirst
    findUniqueZone: typeof findUniqueZone
  }
}

describe('WaterPoint connectionNumber', () => {
  describe('entity round-trip', () => {
    it('preserves connectionNumber in toDto/fromDto', () => {
      const point = createWaterPoint({ connectionNumber: 'C35' })
      const roundTripped = WaterPoint.fromDto(point.toDto())

      expect(roundTripped.connectionNumber).toBe('C35')
    })

    it('omits connectionNumber when null', () => {
      const point = createWaterPoint({ connectionNumber: undefined })
      const dto = point.toDto()

      expect(dto.connectionNumber).toBeUndefined()
    })
  })

  describe('WaterPointPrismaRepository.save uniqueness', () => {
    let repository: WaterPointPrismaRepository
    let db: ReturnType<typeof createMockDb>

    beforeEach(() => {
      db = createMockDb({ communityId: 'community-1', duplicateId: null })
      repository = new WaterPointPrismaRepository(db)
    })

    it('allows save when connectionNumber is not set', async () => {
      const point = createWaterPoint({ connectionNumber: undefined })

      await repository.save(point)

      expect(db.upsert).toHaveBeenCalledTimes(1)
      expect(db.findFirst).not.toHaveBeenCalled()
    })

    it('allows save when connectionNumber is unique within community', async () => {
      const point = createWaterPoint({ connectionNumber: 'C35' })

      await repository.save(point)

      expect(db.findUniqueZone).toHaveBeenCalledTimes(1)
      expect(db.findFirst).toHaveBeenCalledTimes(1)
      expect(db.upsert).toHaveBeenCalledTimes(1)
    })

    it('rejects duplicate connectionNumber within same community', async () => {
      db = createMockDb({ communityId: 'community-1', duplicateId: 'other-point-id' })
      repository = new WaterPointPrismaRepository(db)

      const point = createWaterPoint({ connectionNumber: 'C35' })

      await expect(repository.save(point)).rejects.toThrow(DuplicateConnectionNumberError)
      expect(db.upsert).not.toHaveBeenCalled()
    })

    it('allows same connectionNumber when no duplicate exists (different community)', async () => {
      db = createMockDb({ communityId: 'community-2', duplicateId: null })
      repository = new WaterPointPrismaRepository(db)

      const point = createWaterPoint({ connectionNumber: 'C35' })

      await repository.save(point)

      expect(db.upsert).toHaveBeenCalledTimes(1)
    })

    it('allows multiple points with null connectionNumber', async () => {
      const pointA = createWaterPoint({ connectionNumber: undefined })
      const pointB = createWaterPoint({ connectionNumber: undefined })

      await repository.save(pointA)
      await repository.save(pointB)

      expect(db.findFirst).not.toHaveBeenCalled()
      expect(db.upsert).toHaveBeenCalledTimes(2)
    })
  })
})
