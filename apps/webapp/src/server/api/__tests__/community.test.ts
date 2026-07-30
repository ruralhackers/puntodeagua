import { beforeAll, describe, expect, it } from 'bun:test'
import {
  aCommunityWithFullSetup,
  asManagerOf,
  aWaterDeposit,
  expectForbidden,
  setupTestDatabase
} from '@pda/testing'
import { createCaller } from '@/server/api/root'

describe('community router', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should reject listing zones of another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(caller.community.getCommunityZones({ id: b.community.id }))
  })

  it('should reject listing water points of another community zone', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(caller.community.getWaterPoints({ zoneIds: [b.zone.id] }))
  })

  it('should reject reading a water point of another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(caller.community.getWaterPointById({ id: b.waterPoint.id }))
  })

  it('should reject listing deposits of another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    await aWaterDeposit({ communityId: b.community.id })
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(caller.community.getWaterDepositsByCommunityId({ id: b.community.id }))
  })

  it('should reject listing water points with account of another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(
      caller.community.getWaterPointsByCommunityWithAccount({ communityId: b.community.id })
    )
  })

  it('should reject updating a water point of another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(
      caller.community.updateWaterPointData({ waterPointId: b.waterPoint.id, name: 'Hijacked' })
    )
  })

  it('should allow listing zones of the caller community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const zones = await caller.community.getCommunityZones({ id: a.community.id })

    // Assert
    expect(zones.map((zone) => zone.id)).toContain(a.zone.id)
  })

  it('should allow reading a water point of the caller community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const waterPoint = await caller.community.getWaterPointById({ id: a.waterPoint.id })

    // Assert
    expect(waterPoint?.id).toBe(a.waterPoint.id)
  })

  it('should allow updating a water point of the caller community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.community.updateWaterPointData({
      waterPointId: a.waterPoint.id,
      name: 'Renamed'
    })

    // Assert
    expect(result?.waterPointId).toBe(a.waterPoint.id)
  })

  it('should persist the maps url of a water point', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    await caller.community.updateWaterPointData({
      waterPointId: a.waterPoint.id,
      mapsUrl: 'https://maps.app.goo.gl/aBc123'
    })
    const stored = await caller.community.getWaterPointById({ id: a.waterPoint.id })

    // Assert
    expect(stored?.mapsUrl).toBe('https://maps.app.goo.gl/aBc123')
  })
})
