import { beforeAll, describe, expect, it } from 'bun:test'
import { client as prisma } from '@pda/database'
import { asAnonymous, asManagerOf, setupTestDatabase } from '@pda/testing'
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
})
