import { describe, expect, it } from 'bun:test'
import { periodConsumptionStats } from '../domain/period-consumption-stats'

describe('periodConsumptionStats', () => {
  it('returns nulls when fewer than 2 readings', () => {
    expect(periodConsumptionStats([])).toEqual({
      totalConsumption: null,
      days: null,
      averageConsumptionPerDay: null
    })
    expect(
      periodConsumptionStats([{ normalizedReading: 100, readingDate: new Date('2026-07-01') }])
    ).toEqual({
      totalConsumption: null,
      days: null,
      averageConsumptionPerDay: null
    })
  })

  it('computes total and average per day for a period', () => {
    const result = periodConsumptionStats([
      { normalizedReading: 1000, readingDate: new Date('2026-07-01') },
      { normalizedReading: 1300, readingDate: new Date('2026-07-11') },
      { normalizedReading: 1600, readingDate: new Date('2026-07-21') }
    ])

    expect(result.totalConsumption).toBe(600)
    expect(result.days).toBe(20)
    expect(result.averageConsumptionPerDay).toBe(30)
  })

  it('returns average null when days is 0', () => {
    const result = periodConsumptionStats([
      { normalizedReading: 100, readingDate: new Date('2026-07-01T10:00:00Z') },
      { normalizedReading: 150, readingDate: new Date('2026-07-01T18:00:00Z') }
    ])

    expect(result.totalConsumption).toBe(50)
    expect(result.days).toBe(0)
    expect(result.averageConsumptionPerDay).toBeNull()
  })
})
