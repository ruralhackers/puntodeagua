import { describe, expect, it } from 'bun:test'
import {
  canAccessAdminPanel,
  isStaff,
  isWaterMeterReaderOnly
} from './user-roles'

describe('user role helpers', () => {
  it('detects WATER_METER_READER-only users', () => {
    expect(isWaterMeterReaderOnly(['WATER_METER_READER'])).toBe(true)
    expect(isWaterMeterReaderOnly(['WATER_METER_READER', 'MANAGER'])).toBe(false)
    expect(isWaterMeterReaderOnly(['MANAGER'])).toBe(false)
  })

  it('detects staff users', () => {
    expect(isStaff(['ADMIN'])).toBe(true)
    expect(isStaff(['COMMUNITY_ADMIN'])).toBe(true)
    expect(isStaff(['MANAGER'])).toBe(true)
    expect(isStaff(['WATER_METER_READER'])).toBe(false)
  })

  it('allows admin panel access only for ADMIN and COMMUNITY_ADMIN', () => {
    expect(canAccessAdminPanel(['ADMIN'])).toBe(true)
    expect(canAccessAdminPanel(['COMMUNITY_ADMIN'])).toBe(true)
    expect(canAccessAdminPanel(['MANAGER'])).toBe(false)
    expect(canAccessAdminPanel(['WATER_METER_READER'])).toBe(false)
  })
})
