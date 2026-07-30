import { beforeAll, describe, expect, it } from 'bun:test'
import {
  aCommunity,
  asManagerOf,
  aUser,
  expectForbidden,
  expectTrpcCode,
  setupTestDatabase
} from '@pda/testing'
import { createCaller } from '@/server/api/root'

describe('user router', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should reject reading a user of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    const foreignUser = await aUser({ communityId: other.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(caller.user.getById({ id: foreignUser.id }))
  })

  it('should reject updating a user of another community', async () => {
    // Arrange
    const own = await aCommunity()
    const other = await aCommunity()
    const foreignUser = await aUser({ communityId: other.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectForbidden(caller.user.update({ id: foreignUser.id, name: 'Hijacked' }))
  })

  it('should not accept a passwordHash from the client', async () => {
    // Arrange
    const own = await aCommunity()
    const user = await aUser({ communityId: own.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert: the field is not part of the input schema any more
    await expect(
      caller.user.update({
        id: user.id,
        name: 'Renamed',
        // biome-ignore lint/suspicious/noExplicitAny: asserting the field is rejected
        passwordHash: '$2a$10$attackerControlledHash'
        // biome-ignore lint/suspicious/noExplicitAny: asserting the field is rejected
      } as any)
    ).rejects.toThrow()
  })

  it('should reject deleting a user as not implemented', async () => {
    // Arrange
    const own = await aCommunity()
    const user = await aUser({ communityId: own.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act & Assert
    await expectTrpcCode(caller.user.delete({ id: user.id }), 'NOT_IMPLEMENTED')
  })

  it('should accept a real cuid id, not only a uuid', async () => {
    // Arrange: Prisma generates cuid ids, but the router validated uuid, so
    // every real id was rejected and the admin users screen was broken.
    const own = await aCommunity()
    const user = await aUser({ communityId: own.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act
    const found = await caller.user.getById({ id: user.id })

    // Assert
    expect(found?.id).toBe(user.id)
  })

  it('should allow updating a user of the caller community', async () => {
    // Arrange
    const own = await aCommunity()
    const user = await aUser({ communityId: own.id })
    const caller = createCaller(asManagerOf(own.id))

    // Act
    const updated = await caller.user.update({ id: user.id, name: 'Renamed' })

    // Assert
    expect(updated.name).toBe('Renamed')
  })
})
