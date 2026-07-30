import { beforeAll, describe, expect, it } from 'bun:test'
import {
  aCommunity,
  asAdmin,
  asManagerOf,
  asManagerWithoutCommunity,
  asReaderOf,
  setupTestDatabase
} from '@pda/testing'
import { createCaller } from '@/server/api/root'

const baseQuery = { page: 1, limit: 50, filters: [] }

describe('communityScopedProcedure', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should reject a non-admin staff user with no community assigned', async () => {
    // Arrange
    const caller = createCaller(asManagerWithoutCommunity())

    // Act & Assert
    await expect(
      caller.table.domainTable({ model: 'user', queryParams: baseQuery })
    ).rejects.toThrow(/community/i)
  })

  it('should reject a water meter reader', async () => {
    // Arrange
    const community = await aCommunity()
    const caller = createCaller(asReaderOf(community.id))

    // Act & Assert
    await expect(
      caller.table.domainTable({ model: 'user', queryParams: baseQuery })
    ).rejects.toThrow(/FORBIDDEN/)
  })

  it('should give a global scope to an admin with no community assigned', async () => {
    // Arrange
    await aCommunity()
    await aCommunity()
    const caller = createCaller(asAdmin(null))

    // Act
    const result = await caller.table.domainTable({ model: 'community', queryParams: baseQuery })

    // Assert
    expect(result.totalItems).toBeGreaterThanOrEqual(2)
  })

  it('should scope a manager to their own community', async () => {
    // Arrange
    const own = await aCommunity()
    await aCommunity()
    const caller = createCaller(asManagerOf(own.id))

    // Act
    const result = await caller.table.domainTable({ model: 'community', queryParams: baseQuery })

    // Assert
    expect(result.totalItems).toBe(1)
    expect((result.items[0] as { id: string }).id).toBe(own.id)
  })
})
