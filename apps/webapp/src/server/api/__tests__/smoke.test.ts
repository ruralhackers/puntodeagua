import { beforeAll, describe, expect, it } from 'bun:test'
import { client as prisma } from '@pda/database'
import {
  aCommunity,
  aCommunityWithFullSetup,
  aCommunityZone,
  anAnalysis,
  anIncident,
  aProvider,
  asAnonymous,
  asManagerOf,
  aUser,
  aWaterDeposit,
  aWaterPoint,
  setupTestDatabase
} from '@pda/testing'
import { createCaller } from '@/server/api/root'

describe('test harness', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should refuse to run against a database not ending in _test', () => {
    // Arrange
    const url = process.env.DATABASE_URL ?? ''

    // Act
    const databaseName = url.split('/').pop()?.split('?')[0]

    // Assert
    expect(databaseName).toEndWith('_test')
  })

  it('should reject an unauthenticated call', async () => {
    // Arrange
    const caller = createCaller(asAnonymous())

    // Act & Assert
    await expect(caller.community.getWaterPoints({ zoneIds: [] })).rejects.toThrow()
  })

  it('should have applied the schema', async () => {
    // Arrange & Act
    const count = await prisma.community.count()

    // Assert
    expect(count).toBe(0)
  })

  it('should call a procedure with a fake staff session', async () => {
    // Arrange
    const community = await prisma.community.create({
      data: { name: 'Smoke Community', waterLimitRule: { type: 'PERSON_BASED', value: 100 } }
    })
    const caller = createCaller(asManagerOf(community.id))

    // Act
    const zones = await caller.community.getCommunityZones({ id: community.id })

    // Assert
    expect(zones).toEqual([])
  })

  it('should create two fully independent communities', async () => {
    // Arrange & Act
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()

    // Assert
    expect(a.community.id).not.toBe(b.community.id)
    expect(a.meter.id).not.toBe(b.meter.id)
    expect(a.reading.waterMeterId).toBe(a.meter.id)
    expect(await prisma.community.count()).toBeGreaterThanOrEqual(2)
  })

  it('should create every standalone factory without missing required fields', async () => {
    // Arrange
    const community = await aCommunity()
    const zone = await aCommunityZone({ communityId: community.id })
    const waterPoint = await aWaterPoint({ communityZoneId: zone.id })

    // Act
    const deposit = await aWaterDeposit({ communityId: community.id })
    const incident = await anIncident({ communityId: community.id, waterPointId: waterPoint.id })
    const analysis = await anAnalysis({ communityId: community.id })
    const provider = await aProvider({ communityId: community.id })
    const user = await aUser({ communityId: community.id })

    // Assert
    expect(deposit.communityId).toBe(community.id)
    expect(incident.waterPointId).toBe(waterPoint.id)
    expect(analysis.ph).toBe('7')
    expect(provider.communityId).toBe(community.id)
    expect(user.roles).toEqual(['MANAGER'])
  })
})
