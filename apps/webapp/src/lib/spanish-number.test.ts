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

  it('treats dots as thousands separators when a comma is present', () => {
    expect(parseSpanishNumber('1.234,56')).toBe(1234.56)
    expect(parseSpanishNumber('1.234.567,89')).toBe(1234567.89)
  })

  it('returns 0 for empty or non-numeric input', () => {
    expect(parseSpanishNumber('')).toBe(0)
    expect(parseSpanishNumber('   ')).toBe(0)
    expect(parseSpanishNumber('abc')).toBe(0)
  })

  // The disambiguation that matters. A dot followed by exactly three digits
  // groups thousands; anything else is a decimal point. These four rows are
  // the shapes a field worker actually types.
  describe('a lone dot, disambiguated by what follows it', () => {
    it('groups thousands when exactly three digits follow', () => {
      expect(parseSpanishNumber('12.345')).toBe(12345)
      expect(parseSpanishNumber('1.234')).toBe(1234)
      expect(parseSpanishNumber('1.234.567')).toBe(1234567)
      expect(parseSpanishNumber('12.345.678')).toBe(12345678)
    })

    it('is a decimal point otherwise', () => {
      expect(parseSpanishNumber('1234.5')).toBe(1234.5)
      expect(parseSpanishNumber('12.34')).toBe(12.34)
      expect(parseSpanishNumber('1.2345')).toBe(1.2345)
      expect(parseSpanishNumber('0.5')).toBe(0.5)
    })

    it('treats a leading dot as a decimal point, never as grouping', () => {
      expect(parseSpanishNumber('.5')).toBe(0.5)
      expect(parseSpanishNumber('.500')).toBe(0.5)
    })

    it('keeps earlier dots as grouping when the last one is decimal', () => {
      expect(parseSpanishNumber('1.234.56')).toBe(1234.56)
    })
  })
})

describe('normalizeDecimalInput', () => {
  it('keeps digits, dots and one comma', () => {
    expect(normalizeDecimalInput('1234.5')).toBe('1234.5')
    expect(normalizeDecimalInput('1.234,56')).toBe('1.234,56')
    expect(normalizeDecimalInput('12.345')).toBe('12.345')
  })

  it('does not rewrite the separator', () => {
    // Interpreting the separator is parseSpanishNumber's job, once the number
    // is complete. Rewriting here would commit too early.
    expect(normalizeDecimalInput('12.3')).toBe('12.3')
  })

  it('drops a second comma', () => {
    expect(normalizeDecimalInput('1,2,3')).toBe('1,23')
  })

  it('strips non-numeric characters', () => {
    expect(normalizeDecimalInput('abc12')).toBe('12')
    expect(normalizeDecimalInput('-5')).toBe('5')
    expect(normalizeDecimalInput('1 234')).toBe('1234')
    expect(normalizeDecimalInput('')).toBe('')
  })

  it('is idempotent', () => {
    for (const raw of ['1234.5', '1.234,56', '1,2,3', 'abc12', ',5', '.5', '', '1234,00', '-5']) {
      const once = normalizeDecimalInput(raw)
      expect(normalizeDecimalInput(once)).toBe(once)
    }
  })

  it('only ever emits digits, dots and at most one comma', () => {
    for (const raw of ['1.234,56', 'a1b2.3c,4', '...,,,', '9', '€12,50']) {
      expect(normalizeDecimalInput(raw)).toMatch(/^[0-9.]*,?[0-9.]*$/)
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

  it('keeps the third decimal the schema stores', () => {
    // reading is Decimal(10, 3). At two decimals, opening the edit modal to
    // change only a note would silently round the stored reading.
    expect(formatForInput(1234.567)).toBe('1234,567')
  })

  it('round-trips through the parser', () => {
    for (const v of [0, 0.5, 5, 1234, 12345, 1234.56, 1234.567, 1234567.89]) {
      expect(parseSpanishNumber(formatForInput(v))).toBe(v)
    }
  })
})

describe('formatToSpanish', () => {
  it('groups thousands for display', () => {
    expect(formatToSpanish(12345)).toBe('12.345,00')
    expect(formatToSpanish(1234567.89)).toBe('1.234.567,89')
  })

  it('omits grouping below five integer digits, as es-ES does', () => {
    expect(formatToSpanish(1234)).toBe('1234,00')
  })

  it('round-trips through the parser', () => {
    for (const v of [0, 0.5, 5, 1234, 12345, 1234.56, 1234.567, 1234567.89]) {
      expect(parseSpanishNumber(formatToSpanish(v))).toBe(v)
    }
  })
})

describe('the corruption paths this module exists to close', () => {
  it('no longer multiplies a keypad decimal by ten', () => {
    // Was: every dot stripped as grouping, so "1234.5" became 12345.
    expect(parseSpanishNumber('1234.5')).toBe(1234.5)
  })

  it('still reads a Spanish grouped integer correctly', () => {
    // A live-normalising input would have turned this into 12,345.
    expect(parseSpanishNumber('12.345')).toBe(12345)
  })

  it('survives an edit-modal round trip for a three-decimal reading', () => {
    const stored = 12345.678
    const seeded = formatForInput(stored)
    expect(parseSpanishNumber(normalizeDecimalInput(seeded))).toBe(stored)
  })
})
