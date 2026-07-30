import { beforeAll, describe, expect, it } from 'bun:test'
import {
  aCommunityWithFullSetup,
  asManagerOf,
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
