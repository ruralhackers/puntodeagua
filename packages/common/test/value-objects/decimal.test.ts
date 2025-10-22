import { describe, expect, it } from 'bun:test'
import { Decimal } from '../../domain/value-objects/decimal'

describe('Decimal', () => {
  describe('creation', () => {
    it('should create from string without scientific notation', () => {
      // Arrange
      const value = '100'

      // Act
      const d = Decimal.fromString(value)

      // Assert
      expect(d.toString()).toBe('100')
    })

    it('should create from number', () => {
      // Arrange
      const value = 42

      // Act
      const d = Decimal.fromNumber(value)

      // Assert
      expect(d.toNumber()).toBe(42)
      expect(d.toString()).toBe('42')
    })

    it('should normalize leading zeros', () => {
      // Arrange
      const value = '00100'

      // Act
      const d = Decimal.fromString(value)

      // Assert
      expect(d.toString()).toBe('100')
    })

    it('should preserve long decimal precision without trimming', () => {
      // Arrange
      const value = '100.12345678901234567890'

      // Act
      const d = Decimal.fromString(value)

      // Assert
      expect(d.toString()).toBe('100.1234567890123456789')
    })
  })

  describe('validation', () => {
    it('should reject negative values', () => {
      // Arrange
      const negativeValue = '-1'

      // Act & Assert
      expect(() => Decimal.fromString(negativeValue)).toThrow('Decimal cannot be negative')
    })

    it('should reject NaN', () => {
      // Arrange
      const nanValue = 'NaN'

      // Act & Assert
      expect(() => Decimal.fromString(nanValue)).toThrow()
    })

    it('should reject Infinity', () => {
      // Arrange
      const infinityValue = 'Infinity'

      // Act & Assert
      expect(() => Decimal.fromString(infinityValue)).toThrow()
    })
  })

  describe('constants', () => {
    it('should have ZERO constant equal to zero', () => {
      // Act & Assert
      expect(Decimal.ZERO.isZero()).toBe(true)
      expect(Decimal.ZERO.toString()).toBe('0')
    })

    it('should have ONE constant equal to one', () => {
      // Act & Assert
      expect(Decimal.ONE.isOne()).toBe(true)
      expect(Decimal.ONE.toString()).toBe('1')
    })
  })

  describe('comparisons', () => {
    it('should perform less than and greater than comparisons correctly', () => {
      // Arrange
      const a = Decimal.fromString('1')
      const b = Decimal.fromString('2')

      // Act & Assert
      expect(a.isLessThan(b)).toBe(true)
      expect(b.isGreaterThan(a)).toBe(true)
      expect(a.isGreaterThanOrEqualTo(a)).toBe(true)
      expect(a.isLessThanOrEqualTo(a)).toBe(true)
    })
  })

  describe('arithmetic', () => {
    it('should throw when subtract results in negative', () => {
      // Arrange
      const a = Decimal.fromString('2')
      const b = Decimal.fromString('5')

      // Act & Assert
      expect(() => a.subtract(b)).toThrow('Result would be negative')
    })

    it('should add decimals with exact precision', () => {
      // Arrange
      const a = Decimal.fromString('1.00000000000000000001')
      const b = Decimal.fromString('2.5')

      // Act
      const result = a.add(b)

      // Assert
      expect(result.toString()).toBe('3.50000001')
    })

    it('should subtract with non-negative result', () => {
      // Arrange
      const a = Decimal.fromString('5')
      const b = Decimal.fromString('2')

      // Act
      const result = a.subtract(b)

      // Assert
      expect(result.toString()).toBe('3')
    })

    it('should multiply by number', () => {
      // Arrange
      const a = Decimal.fromString('1.23')

      // Act
      const m = a.multiplyBy(2)

      // Assert
      expect(m.toString()).toBe('2.46')
    })

    it('should divide by number', () => {
      // Arrange
      const a = Decimal.fromString('10')

      // Act
      const r = a.divideBy(4)

      // Assert
      expect(r.toString()).toBe('2.5')
    })

    it('should divide by decimal', () => {
      // Arrange
      const a = Decimal.fromString('10')
      const b = Decimal.fromString('2')

      // Act
      const result = a.divideByDecimal(b)

      // Assert
      expect(result.toString()).toBe('5')
    })

    it('should multiply by decimal', () => {
      // Arrange
      const a = Decimal.fromString('1.5')
      const b = Decimal.fromString('2')

      // Act
      const result = a.multiplyByDecimal(b)

      // Assert
      expect(result.toString()).toBe('3')
    })
  })

  describe('min max', () => {
    it('should return smaller value with min', () => {
      // Arrange
      const a = Decimal.fromString('1')
      const b = Decimal.fromString('2')

      // Act
      const result = a.min(b)

      // Assert
      expect(result.toString()).toBe('1')
    })

    it('should return larger value with max', () => {
      // Arrange
      const a = Decimal.fromString('1')
      const b = Decimal.fromString('2')

      // Act
      const result = a.max(b)

      // Assert
      expect(result.toString()).toBe('2')
    })
  })

  describe('decimals rounding (ceil)', () => {
    it('should round up last kept decimal', () => {
      // Arrange
      const original = Decimal.fromString('1.2101')

      // Act
      const rounded = original.decimals(2)

      // Assert
      expect(rounded.toString()).toBe('1.22')
    })

    it('should not change when already exact', () => {
      // Arrange
      const original = Decimal.fromString('1.2300')

      // Act
      const rounded = original.decimals(2)

      // Assert
      expect(rounded.toString()).toBe('1.23')
    })
  })

  describe('toUnits/fromUnits', () => {
    it('should scale down preserving precision with fromUnits', () => {
      // Arrange & Act
      const d = Decimal.fromUnits('123456', 3) // 123.456

      // Assert
      expect(d.toString()).toBe('123.456')
    })

    it('should scale up preserving precision with toUnits', () => {
      // Arrange
      const d = Decimal.fromString('123.456')

      // Act
      const units = d.toUnits(3)

      // Assert
      expect(units.toString()).toBe('123456')
    })
  })

  describe('error cases', () => {
    it('should throw when dividing by zero number', () => {
      // Arrange
      const d = Decimal.fromString('1')

      // Act & Assert
      expect(() => d.divideBy(0)).toThrow('Divisor must be > 0')
    })

    it('should throw when dividing by zero decimal', () => {
      // Arrange
      const d = Decimal.fromString('1')

      // Act & Assert
      expect(() => d.divideByDecimal(Decimal.ZERO)).toThrow('Division by zero')
    })

    it('should throw when multiplying by negative factor', () => {
      // Arrange
      const d = Decimal.fromString('1')

      // Act & Assert
      expect(() => d.multiplyBy(-1)).toThrow('Negative factor')
    })
  })

  describe('formatting (avoid scientific notation)', () => {
    it('should not use scientific notation for typical small numbers', () => {
      // Arrange
      const samples = ['0.1', '0.01', '0.001', '0.00000001']

      // Act & Assert
      for (const s of samples) {
        const d = Decimal.fromString(s)
        expect(d.toString()).toBe(s)
        expect(d.toString().toLowerCase()).not.toContain('e')
      }
    })
  })
})
