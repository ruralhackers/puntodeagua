import { describe, expect, it } from 'bun:test'
import { isPathAllowedForWaterMeterReader } from './water-meter-reader-paths'

describe('water meter reader path access', () => {
  it('allows lecturas list and detail pages', () => {
    expect(isPathAllowedForWaterMeterReader('/water-meter/new')).toBe(true)
    expect(isPathAllowedForWaterMeterReader('/water-meter/abc-123')).toBe(true)
  })

  it('blocks staff routes', () => {
    expect(isPathAllowedForWaterMeterReader('/water-meter')).toBe(false)
    expect(isPathAllowedForWaterMeterReader('/admin')).toBe(false)
    expect(isPathAllowedForWaterMeterReader('/export')).toBe(false)
    expect(isPathAllowedForWaterMeterReader('/water-point/abc')).toBe(false)
  })
})
