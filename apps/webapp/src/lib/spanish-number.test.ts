import { describe, expect, it } from 'bun:test'
import {
  formatForInput,
  formatToSpanish,
  normalizeDecimalInput,
  parseSpanishNumber
} from './spanish-number'

describe('parseSpanishNumber', () => {
  it('parses plain integers', () => {
    expect(parseSpanishNumber('1234')).toBe(1234)
  })

  it('treats the comma as the decimal separator', () => {
    expect(parseSpanishNumber('1234,56')).toBe(1234.56)
    expect(parseSpanishNumber('0,5')).toBe(0.5)
    expect(parseSpanishNumber(',5')).toBe(0.5)
  })

  it('treats dots as thousands separators', () => {
    expect(parseSpanishNumber('1.234,56')).toBe(1234.56)
    expect(parseSpanishNumber('1.234.567,89')).toBe(1234567.89)
    expect(parseSpanishNumber('1.234')).toBe(1234)
  })

  it('returns 0 for empty or non-numeric input', () => {
    expect(parseSpanishNumber('')).toBe(0)
    expect(parseSpanishNumber('   ')).toBe(0)
    expect(parseSpanishNumber('abc')).toBe(0)
  })
})

describe('normalizeDecimalInput', () => {
  it('converts a typed dot into the decimal comma', () => {
    // This is the 10x-corruption bug: "1234.5" used to parse as 12345.
    expect(normalizeDecimalInput('1234.5')).toBe('1234,5')
  })

  it('leaves an already-normal value untouched', () => {
    expect(normalizeDecimalInput('1234,5')).toBe('1234,5')
    expect(normalizeDecimalInput('1234,00')).toBe('1234,00')
  })

  it('keeps only the first separator', () => {
    expect(normalizeDecimalInput('1,2,3')).toBe('1,23')
    expect(normalizeDecimalInput('12.34.5')).toBe('12,345')
  })

  it('strips non-numeric characters', () => {
    expect(normalizeDecimalInput('abc12')).toBe('12')
    expect(normalizeDecimalInput('')).toBe('')
  })

  it('keeps a leading separator', () => {
    expect(normalizeDecimalInput(',5')).toBe(',5')
    expect(normalizeDecimalInput('.5')).toBe(',5')
  })

  it('is idempotent', () => {
    for (const raw of [
      '1234.5',
      '1234,5',
      '1,2,3',
      '12.34.5',
      'abc12',
      ',5',
      '.5',
      '',
      '1234,00'
    ]) {
      const once = normalizeDecimalInput(raw)
      expect(normalizeDecimalInput(once)).toBe(once)
    }
  })

  it('only ever emits digits and at most one comma', () => {
    for (const raw of ['1.234,56', 'a1b2.3c,4', '...,,,', '9']) {
      const out = normalizeDecimalInput(raw)
      expect(out).toMatch(/^[0-9]*,?[0-9]*$/)
    }
  })
})

describe('formatForInput', () => {
  it('never groups thousands, however large', () => {
    expect(formatForInput(0)).toBe('0,00')
    expect(formatForInput(1234.56)).toBe('1234,56')
    expect(formatForInput(12345)).toBe('12345,00')
    expect(formatForInput(1234567.89)).toBe('1234567,89')
  })

  it('produces a value normalizeDecimalInput leaves untouched', () => {
    for (const v of [0, 5, 1234, 12345, 1234.56, 1234567.89]) {
      const seeded = formatForInput(v)
      expect(normalizeDecimalInput(seeded)).toBe(seeded)
    }
  })
})

describe('formatToSpanish', () => {
  it('groups thousands for display', () => {
    expect(formatToSpanish(12345)).toBe('12.345,00')
    expect(formatToSpanish(1234567.89)).toBe('1.234.567,89')
  })

  it('omits grouping below five integer digits, as es-ES does', () => {
    // Intl's es-ES minimumGroupingDigits is 2, so four-digit integers are
    // not grouped. Pinned here because the formatForInput split below only
    // matters for values that DO get grouped.
    expect(formatToSpanish(1234)).toBe('1234,00')
    expect(formatToSpanish(999)).toBe('999,00')
  })
})

describe('why formatForInput exists', () => {
  it('normalising a grouped display value would corrupt it by 1000x', () => {
    // A realistic meter reading. Seeding an input with the *display* format
    // and then normalising one keystroke would silently divide it by 1000.
    const reading = 12345
    const grouped = formatToSpanish(reading)
    expect(grouped).toBe('12.345,00')
    expect(parseSpanishNumber(normalizeDecimalInput(grouped))).toBe(12.345)

    // Seeding with the input format is stable under the same keystroke.
    const seeded = formatForInput(reading)
    expect(parseSpanishNumber(normalizeDecimalInput(seeded))).toBe(reading)
  })
})

describe('round trips', () => {
  it('survives the input format', () => {
    for (const v of [0, 0.5, 5, 1234, 1234.56, 1234567.89]) {
      expect(parseSpanishNumber(formatForInput(v))).toBe(v)
    }
  })

  it('survives the display format', () => {
    for (const v of [0, 0.5, 5, 1234, 1234.56, 1234567.89]) {
      expect(parseSpanishNumber(formatToSpanish(v))).toBe(v)
    }
  })
})
