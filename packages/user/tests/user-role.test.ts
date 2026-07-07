import { describe, expect, it } from 'bun:test'
import { UserRole } from '../domain/value-objects/user-role'

describe('UserRole', () => {
  it('accepts WATER_METER_READER as a valid role', () => {
    const role = UserRole.fromString('WATER_METER_READER')
    expect(role.toString()).toBe('WATER_METER_READER')
    expect(role.isWaterMeterReader()).toBe(true)
  })

  it('creates WATER_METER_READER via factory', () => {
    const role = UserRole.waterMeterReader()
    expect(role.isWaterMeterReader()).toBe(true)
    expect(role.isStaff()).toBe(false)
  })

  it('identifies staff roles correctly', () => {
    expect(UserRole.fromString('ADMIN').isStaff()).toBe(true)
    expect(UserRole.fromString('COMMUNITY_ADMIN').isStaff()).toBe(true)
    expect(UserRole.fromString('MANAGER').isStaff()).toBe(true)
    expect(UserRole.fromString('WATER_METER_READER').isStaff()).toBe(false)
  })

  it('rejects invalid roles', () => {
    expect(() => UserRole.fromString('READER')).toThrow('Invalid role: READER')
  })
})
