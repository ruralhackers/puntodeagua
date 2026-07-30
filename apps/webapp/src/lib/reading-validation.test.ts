import { describe, expect, it } from 'bun:test'
import { validateReading } from './reading-validation'

const NOW = new Date('2026-07-30T12:00:00')

function input(overrides: Partial<Parameters<typeof validateReading>[0]> = {}) {
  return {
    normalizedReading: 5000,
    readingDate: new Date('2026-07-30T11:00:00'),
    lastReadingValue: 4000,
    lastReadingDate: new Date('2026-07-01T10:00:00'),
    now: NOW,
    ...overrides
  }
}

describe('validateReading', () => {
  it('accepts a valid reading', () => {
    expect(validateReading(input())).toBeNull()
  })

  it('rejects a future date and blames the date field', () => {
    const error = validateReading(input({ readingDate: new Date('2026-07-31T09:00:00') }))
    expect(error).toEqual({
      field: 'date',
      message: 'La fecha y hora no pueden ser futuras'
    })
  })

  it('rejects a date at or before the last reading and blames the date field', () => {
    const error = validateReading(input({ readingDate: new Date('2026-07-01T10:00:00') }))
    expect(error).toEqual({
      field: 'date',
      message: 'La nueva lectura debe ser posterior a la última lectura'
    })
  })

  it('rejects a value lower than the last reading and blames the reading field', () => {
    const error = validateReading(input({ normalizedReading: 3999 }))
    expect(error).toEqual({
      field: 'reading',
      message: 'La nueva lectura no puede ser menor que la última lectura'
    })
  })

  it('allows a value equal to the last reading', () => {
    expect(validateReading(input({ normalizedReading: 4000 }))).toBeNull()
  })

  it('skips last-reading checks when there is no previous reading', () => {
    const error = validateReading(
      input({ normalizedReading: 0, lastReadingValue: null, lastReadingDate: null })
    )
    expect(error).toBeNull()
  })

  it('reports the date problem first when both date and value are invalid', () => {
    const error = validateReading(
      input({ normalizedReading: 1, readingDate: new Date('2026-07-31T09:00:00') })
    )
    expect(error?.field).toBe('date')
  })
})
