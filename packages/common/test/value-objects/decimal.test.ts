import { describe, expect, it } from 'bun:test'
import { Decimal } from '../../domain/value-objects/decimal'

describe('Decimal', () => {
  describe('creation', () => {
    it('creates from string without scientific notation now', () => {
      const d = Decimal.fromString('100')
      expect(d.toString()).toBe('100')
    })

    it('creates from number', () => {
      const d = Decimal.fromNumber(42)
      expect(d.toNumber()).toBe(42)
      expect(d.toString()).toBe('42')
    })

    it('normalizes leading zeros', () => {
      const d = Decimal.fromString('00100')
      expect(d.toString()).toBe('100')
    })

    it('preserves long decimal precision (no trimming)', () => {
      const d = Decimal.fromString('100.12345678901234567890')
      expect(d.toString()).toBe('100.1234567890123456789')
    })
  })

  describe('validation', () => {
    it('rejects negative', () => {
      expect(() => Decimal.fromString('-1')).toThrow('Decimal cannot be negative')
    })

    it('rejects NaN', () => {
      expect(() => Decimal.fromString('NaN')).toThrow()
    })

    it('rejects Infinity', () => {
      expect(() => Decimal.fromString('Infinity')).toThrow()
    })
  })

  describe('constants', () => {
    it('ZERO is zero', () => {
      expect(Decimal.ZERO.isZero()).toBe(true)
      expect(Decimal.ZERO.toString()).toBe('0')
    })
    it('ONE is one', () => {
      expect(Decimal.ONE.isOne()).toBe(true)
      expect(Decimal.ONE.toString()).toBe('1')
    })
  })

  describe('comparisons', () => {
    it('less/greater checks', () => {
      const a = Decimal.fromString('1')
      const b = Decimal.fromString('2')
      expect(a.isLessThan(b)).toBe(true)
      expect(b.isGreaterThan(a)).toBe(true)
      expect(a.isGreaterThanOrEqualTo(a)).toBe(true)
      expect(a.isLessThanOrEqualTo(a)).toBe(true)
    })
  })

  describe('arithmetic', () => {
    it('adds exact', () => {
      const a = Decimal.fromString('1.00000000000000000001')
      const b = Decimal.fromString('2.5')
      expect(a.add(b).toString()).toBe('3.50000001')
    })

    it('subtracts (non negative result)', () => {
      const a = Decimal.fromString('5')
      const b = Decimal.fromString('2')
      expect(a.subtract(b).toString()).toBe('3')
    })

    it('subtract throws when negative result', () => {
      const a = Decimal.fromString('2')
      const b = Decimal.fromString('5')
      expect(() => a.subtract(b)).toThrow('Result would be negative')
    })

    it('multiply by number', () => {
      const a = Decimal.fromString('1.23')
      const m = a.multiplyBy(2)
      expect(m.toString()).toBe('2.46')
    })

    it('divide by number', () => {
      const a = Decimal.fromString('10')
      const r = a.divideBy(4)
      expect(r.toString()).toBe('2.5')
    })

    it('divide by decimal', () => {
      const a = Decimal.fromString('10')
      const b = Decimal.fromString('2')
      expect(a.divideByDecimal(b).toString()).toBe('5')
    })

    it('multiply by decimal', () => {
      const a = Decimal.fromString('1.5')
      const b = Decimal.fromString('2')
      expect(a.multiplyByDecimal(b).toString()).toBe('3')
    })
  })

  describe('min max', () => {
    it('min returns smaller', () => {
      const a = Decimal.fromString('1')
      const b = Decimal.fromString('2')
      expect(a.min(b).toString()).toBe('1')
    })

    it('max returns larger', () => {
      const a = Decimal.fromString('1')
      const b = Decimal.fromString('2')
      expect(a.max(b).toString()).toBe('2')
    })
  })

  describe('decimals rounding (ceil)', () => {
    it('rounds up last kept decimal', () => {
      const original = Decimal.fromString('1.2101')
      const rounded = original.decimals(2)
      expect(rounded.toString()).toBe('1.22')
    })

    it('no change when already exact', () => {
      const original = Decimal.fromString('1.2300')
      const rounded = original.decimals(2)
      expect(rounded.toString()).toBe('1.23')
    })
  })

  describe('toUnits/fromUnits', () => {
    it('fromUnits scales down preserving precision', () => {
      const d = Decimal.fromUnits('123456', 3) // 123.456
      expect(d.toString()).toBe('123.456')
    })

    it('toUnits scales up preserving precision', () => {
      const d = Decimal.fromString('123.456')
      const units = d.toUnits(3)
      expect(units.toString()).toBe('123456')
    })
  })

  describe('error cases', () => {
    it('divide by zero number', () => {
      const d = Decimal.fromString('1')
      expect(() => d.divideBy(0)).toThrow('Divisor must be > 0')
    })

    it('divide by zero decimal', () => {
      const d = Decimal.fromString('1')
      expect(() => d.divideByDecimal(Decimal.ZERO)).toThrow('Division by zero')
    })

    it('multiply by negative factor', () => {
      const d = Decimal.fromString('1')
      expect(() => d.multiplyBy(-1)).toThrow('Negative factor')
    })
  })

  describe('formatting (avoid scientific notation)', () => {
    it('does not use scientific notation for typical small numbers', () => {
      const samples = ['0.1', '0.01', '0.001', '0.00000001']
      for (const s of samples) {
        const d = Decimal.fromString(s)
        expect(d.toString()).toBe(s)
        expect(d.toString().toLowerCase()).not.toContain('e')
      }
    })
  })
})
