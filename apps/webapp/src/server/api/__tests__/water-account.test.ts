import { beforeAll, describe, expect, it } from 'bun:test'
import {
  aCommunityWithFullSetup,
  aCommunityZone,
  asManagerOf,
  aWaterAccount,
  aWaterMeter,
  aWaterPoint,
  expectForbidden,
  setupTestDatabase
} from '@pda/testing'
import { createCaller } from '@/server/api/root'

describe('waterAccount mutations', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should reject updating a reading from another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(
      caller.waterAccount.updateWaterMeterReading({ id: b.reading.id, reading: '999' })
    )
  })

  it('should reject deleting a reading from another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(caller.waterAccount.deleteWaterMeterReading({ id: b.reading.id }))
  })

  it('should reject recalculating excess for a meter from another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(
      caller.waterAccount.recalculateWaterMeterExcess({ waterMeterId: b.meter.id })
    )
  })

  it('should reject updating the image of a meter from another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(
      caller.waterAccount.updateWaterMeterImage({ waterMeterId: b.meter.id, deleteImage: true })
    )
  })

  it('should reject replacing a meter from another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(
      caller.waterAccount.replaceWaterMeter({
        oldWaterMeterId: b.meter.id,
        newWaterMeterName: 'Hijacked',
        measurementUnit: 'L'
      })
    )
  })

  it('should reject changing the owner of a meter from another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expectForbidden(
      caller.waterAccount.changeWaterMeterOwner({
        waterMeterId: b.meter.id,
        newWaterAccountId: a.account.id
      })
    )
  })

  it('should allow updating a reading from the caller community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.waterAccount.updateWaterMeterReading({
      id: a.reading.id,
      reading: '150'
    })

    // Assert
    expect(result?.reading.id).toBe(a.reading.id)
  })

  it('should allow recalculating excess for a meter from the caller community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.waterAccount.recalculateWaterMeterExcess({
      waterMeterId: a.meter.id
    })

    // Assert
    expect(result).toEqual({ success: true })
  })

  it('should allow changing the owner of a meter from the caller community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const newAccount = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.waterAccount.changeWaterMeterOwner({
      waterMeterId: a.meter.id,
      newWaterAccountId: newAccount.account.id
    })

    // Assert
    expect(result?.waterMeterId).toBe(a.meter.id)
  })

  it('should allow deleting the last reading from the caller community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.waterAccount.deleteWaterMeterReading({ id: a.reading.id })

    // Assert
    expect(result).toEqual({ success: true })
  })
})

describe('exportWaterMeterReadings zone filter', () => {
  const wholePeriod = { startDate: new Date('2020-01-01'), endDate: new Date('2030-01-01') }

  beforeAll(async () => {
    await setupTestDatabase()
  })

  async function aSecondZoneWithMeter(communityId: string) {
    const zone = await aCommunityZone({ communityId })
    const waterPoint = await aWaterPoint({ communityZoneId: zone.id })
    const account = await aWaterAccount()
    const meter = await aWaterMeter({ waterPointId: waterPoint.id, waterAccountId: account.id })
    return { zone, meter }
  }

  it('should return only the meters of the requested zone', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const other = await aSecondZoneWithMeter(a.community.id)
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.waterAccount.exportWaterMeterReadings({
      ...wholePeriod,
      communityZoneId: a.zone.id
    })

    // Assert
    const ids = (result ?? []).map((row) => row.id)
    expect(ids).toContain(a.meter.id)
    expect(ids).not.toContain(other.meter.id)
  })

  it('should export every zone when no zone is given', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const other = await aSecondZoneWithMeter(a.community.id)
    const caller = createCaller(asManagerOf(a.community.id))

    // Act
    const result = await caller.waterAccount.exportWaterMeterReadings(wholePeriod)

    // Assert
    const ids = (result ?? []).map((row) => row.id)
    expect(ids).toContain(a.meter.id)
    expect(ids).toContain(other.meter.id)
  })

  it('should reject a zone that belongs to another community', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const b = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))

    // Act & Assert
    await expect(
      caller.waterAccount.exportWaterMeterReadings({
        ...wholePeriod,
        communityZoneId: b.zone.id
      })
    ).rejects.toThrow(/Zona no encontrada/)
  })
})

describe('meter list maps url', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  it('should expose the water point maps url to the meter list', async () => {
    // Arrange
    const a = await aCommunityWithFullSetup()
    const caller = createCaller(asManagerOf(a.community.id))
    await caller.community.updateWaterPointData({
      waterPointId: a.waterPoint.id,
      mapsUrl: 'https://maps.app.goo.gl/aBc123'
    })

    // Act
    const active = await caller.waterAccount.getActiveWaterMetersOrderedByLastReading({
      zoneIds: [a.zone.id]
    })
    const withInactive = await caller.waterAccount.getActiveWaterMetersOrderedByLastReading({
      zoneIds: [a.zone.id],
      includeInactive: true
    })

    // Assert
    expect(active.find((row) => row.id === a.meter.id)?.waterPoint.mapsUrl).toBe(
      'https://maps.app.goo.gl/aBc123'
    )
    expect(withInactive.find((row) => row.id === a.meter.id)?.waterPoint.mapsUrl).toBe(
      'https://maps.app.goo.gl/aBc123'
    )
  })
})
