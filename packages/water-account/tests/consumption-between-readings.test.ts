import { describe, expect, it } from 'bun:test'
import { consumptionBetweenReadings } from '../domain/consumption-between-readings'

describe('consumptionBetweenReadings', () => {
  it('should calculate exactly 1 day for 24 hours between readings', () => {
    const previous = { normalizedReading: 1000, readingDate: new Date('2026-07-10T12:00:00') }
    const latest = { normalizedReading: 2500, readingDate: new Date('2026-07-11T12:00:00') }

    const result = consumptionBetweenReadings(latest, previous)

    expect(result.hoursBetween).toBe(24)
    expect(result.daysBetween).toBe(1)
    expect(result.consumptionLiters).toBe(1500)
    expect(result.dailyConsumption).toBe(1500)
  })

  it('should extrapolate to full day for 6 hours between readings', () => {
    const previous = { normalizedReading: 1000, readingDate: new Date('2026-07-11T08:00:00') }
    const latest = { normalizedReading: 1100, readingDate: new Date('2026-07-11T14:00:00') }

    const result = consumptionBetweenReadings(latest, previous)

    expect(result.hoursBetween).toBe(6)
    expect(result.daysBetween).toBe(0.25)
    expect(result.consumptionLiters).toBe(100)
    expect(result.dailyConsumption).toBe(400)
  })

  it('should handle fractional hours between readings', () => {
    const previous = { normalizedReading: 5000, readingDate: new Date('2026-07-11T12:00:00') }
    const latest = { normalizedReading: 5200, readingDate: new Date('2026-07-11T13:30:00') }

    const result = consumptionBetweenReadings(latest, previous)

    expect(result.hoursBetween).toBe(1.5)
    expect(result.daysBetween).toBe(0.0625)
    expect(result.consumptionLiters).toBe(200)
    expect(result.dailyConsumption).toBe(3200)
  })
})
