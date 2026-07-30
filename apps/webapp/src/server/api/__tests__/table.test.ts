import { beforeAll, describe, expect, it } from 'bun:test'
import {
  aCommunityWithFullSetup,
  asAdmin,
  asManagerOf,
  aUser,
  setupTestDatabase
} from '@pda/testing'
import { createCaller } from '@/server/api/root'

const baseQuery = { page: 1, limit: 50, filters: [] }

describe('table.domainTable', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should never expose passwordHash', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    await aUser({ communityId: a.community.id })
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.table.domainTable({ model: 'user', queryParams: baseQuery })

    // Assert
    expect(result.items.length).toBeGreaterThan(0)
    for (const item of result.items) {
      expect(item).not.toHaveProperty('passwordHash')
    }
  })

  it('should not return users from another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    await aUser({ communityId: a.community.id })
    const foreignUser = await aUser({ communityId: b.community.id })
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.table.domainTable({ model: 'user', queryParams: baseQuery })

    // Assert
    const ids = result.items.map((item) => (item as { id: string }).id)
    expect(ids).not.toContain(foreignUser.id)
  })

  it('should reject an arbitrary prisma selector from the client', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expect(
      caller.table.domainTable({
        model: 'user',
        // biome-ignore lint/suspicious/noExplicitAny: asserting the input is rejected
        queryParams: { ...baseQuery, selector: { passwordHash: { not: null } } } as any
      })
    ).rejects.toThrow()
  })

  it('should let a global admin see users from every community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const userA = await aUser({ communityId: a.community.id })
    const userB = await aUser({ communityId: b.community.id })
    const caller = createCaller(asAdmin(null))

    // Act
    const result = await caller.table.domainTable({ model: 'user', queryParams: baseQuery })

    // Assert
    const ids = result.items.map((item) => (item as { id: string }).id)
    expect(ids).toContain(userA.id)
    expect(ids).toContain(userB.id)
    for (const item of result.items) {
      expect(item).not.toHaveProperty('passwordHash')
    }
  })

  // These exercise PrismaTableQueryBuilder's search, filter and order paths,
  // which the plain listing tests above never reach.
  it('should filter by a searchable field', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const target = await aUser({ communityId: a.community.id, name: 'Findable Person' })
    await aUser({ communityId: a.community.id, name: 'Someone Else' })
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.table.domainTable({
      model: 'user',
      queryParams: { ...baseQuery, search: 'Findable', searchFields: ['name'] }
    })

    // Assert
    const ids = result.items.map((item) => (item as { id: string }).id)
    expect(ids).toEqual([target.id])
  })

  it('should apply an equals filter', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const target = await aUser({ communityId: a.community.id, name: 'Exact Match' })
    await aUser({ communityId: a.community.id, name: 'Other' })
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.table.domainTable({
      model: 'user',
      queryParams: { ...baseQuery, filters: [{ field: 'name', value: 'Exact Match' }] }
    })

    // Assert
    const ids = result.items.map((item) => (item as { id: string }).id)
    expect(ids).toEqual([target.id])
  })

  it('should order by a field and paginate', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    await aUser({ communityId: a.community.id, name: 'AAA' })
    await aUser({ communityId: a.community.id, name: 'BBB' })
    await aUser({ communityId: a.community.id, name: 'CCC' })
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const page = await caller.table.domainTable({
      model: 'user',
      queryParams: {
        ...baseQuery,
        limit: 2,
        orderBy: { field: 'name', direction: 'asc' }
      }
    })

    // Assert
    expect(page.items).toHaveLength(2)
    expect(page.totalPages).toBe(2)
    expect((page.items[0] as { name: string }).name).toBe('AAA')
    expect((page.items[1] as { name: string }).name).toBe('BBB')
  })

  it('should combine the community scope with a search', async () => {
    // Arrange: the same name in two communities; only the caller's may come back
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const mine = await aUser({ communityId: a.community.id, name: 'Shared Name' })
    const theirs = await aUser({ communityId: b.community.id, name: 'Shared Name' })
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.table.domainTable({
      model: 'user',
      queryParams: { ...baseQuery, search: 'Shared', searchFields: ['name'] }
    })

    // Assert
    const ids = result.items.map((item) => (item as { id: string }).id)
    expect(ids).toContain(mine.id)
    expect(ids).not.toContain(theirs.id)
  })
})
