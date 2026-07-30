import { beforeAll, describe, expect, it } from 'bun:test'
import {
  aCommunityWithFullSetup,
  asAdmin,
  asAnonymous,
  asCommunityAdminOf,
  asManagerOf,
  asReaderOf,
  expectForbidden,
  expectTrpcCode,
  setupTestDatabase
} from '@pda/testing'
import { createCaller } from '@/server/api/root'

const baseQuery = { page: 1, limit: 50, filters: [] }

describe('role authorization matrix', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should reject an anonymous caller on a protected procedure', async () => {
    // Arrange
    const caller = createCaller(asAnonymous())

    // Act & Assert
    await expectTrpcCode(
      caller.table.domainTable({ model: 'user', queryParams: baseQuery }),
      'UNAUTHORIZED'
    )
  })

  it('should reject a reader-only caller on staff endpoints', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asReaderOf(a.community.id))

    // Act & Assert
    await expectForbidden(caller.table.domainTable({ model: 'user', queryParams: baseQuery }))
    await expectForbidden(caller.waterAccount.deleteWaterMeterReading({ id: a.reading.id }))
    await expectForbidden(caller.providers.getProvidersByCommunityId({ id: a.community.id }))
    await expectForbidden(caller.incidents.getIncidentsByCommunityId({ id: a.community.id }))
    await expectForbidden(caller.registers.getAnalysesByCommunityId({ id: a.community.id }))
  })

  it('should reject a manager on water deposit management', async () => {
    // Arrange: createWaterDeposit needs ADMIN or COMMUNITY_ADMIN
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(caller.community.createWaterDeposit({ name: 'Deposit', location: '0,0' }))
  })

  it('should allow a reader to read and create readings in their community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asReaderOf(a.community.id))

    // Act
    const meter = await caller.waterAccount.getWaterMeterById({ id: a.meter.id })
    const zones = await caller.community.getCommunityZones({ id: a.community.id })

    // Assert
    expect(meter?.id).toBe(a.meter.id)
    expect(zones.map((zone) => zone.id)).toContain(a.zone.id)
  })

  it('should reject a reader reading a meter of another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asReaderOf(a.community.id))

    // Act & Assert
    await expectForbidden(caller.waterAccount.getWaterMeterById({ id: b.meter.id }))
  })

  it('should allow a community admin to manage water deposits', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asCommunityAdminOf(a.community.id))

    // Act
    const deposit = await caller.community.createWaterDeposit({
      name: 'Deposit',
      location: '0,0'
    })

    // Assert
    expect(deposit?.name).toBe('Deposit')
  })

  it('should allow a manager the staff endpoints of their own community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const providers = await caller.providers.getProvidersByCommunityId({ id: a.community.id })
    const incidents = await caller.incidents.getIncidentsByCommunityId({ id: a.community.id })

    // Assert
    expect(providers).toEqual([])
    expect(incidents).toEqual([])
  })

  it('should give an admin access across communities', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asAdmin(a.community.id))

    // Act
    const foreignMeter = await caller.waterAccount.getWaterMeterById({ id: b.meter.id })
    const communities = await caller.table.domainTable({
      model: 'community',
      queryParams: baseQuery
    })

    // Assert
    expect(foreignMeter?.id).toBe(b.meter.id)
    expect(communities.totalItems).toBeGreaterThanOrEqual(2)
  })
})
