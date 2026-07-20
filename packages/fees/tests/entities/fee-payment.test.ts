import { describe, expect, it } from 'bun:test'
import { Decimal } from '@pda/common/domain'
import {
  buildDefaultPayerLabel,
  expectedAmountPerPeriod
} from '../../domain/value-objects/fee-defaults'
import { FeeFrequency } from '../../domain/value-objects/fee-frequency'
import { FeePayment } from '../../domain/entities/fee-payment'
import { Id } from '@pda/common/domain'

describe('FeeFrequency', () => {
  it('validates period indexes', () => {
    expect(FeeFrequency.periodsInYear('MONTHLY')).toBe(12)
    FeeFrequency.assertPeriodIndex('MONTHLY', 12)
    expect(() => FeeFrequency.assertPeriodIndex('QUARTERLY', 5)).toThrow()
  })
})

describe('expectedAmountPerPeriod', () => {
  it('splits annual amount by frequency', () => {
    expect(expectedAmountPerPeriod('100', 'ANNUAL').toString()).toBe('100')
    expect(expectedAmountPerPeriod('100', 'SEMIANNUAL').toString()).toBe('50')
    expect(expectedAmountPerPeriod('100', 'QUARTERLY').toString()).toBe('25')
    expect(expectedAmountPerPeriod(Decimal.fromString('100'), 'MONTHLY').toString()).toBe('8.34')
  })
})

describe('buildDefaultPayerLabel', () => {
  it('joins account then point when account exists', () => {
    expect(buildDefaultPayerLabel('Casa 1', 'Juan')).toBe('Juan · Casa 1')
  })

  it('uses only point name when account is null', () => {
    expect(buildDefaultPayerLabel('Casa 1', null)).toBe('Casa 1')
  })
})

describe('FeePayment entity', () => {
  it('creates and serializes periodic payment', () => {
    const payment = FeePayment.create({
      communityId: Id.generateUniqueId().toString(),
      number: 1,
      waterPointId: Id.generateUniqueId().toString(),
      payerLabel: 'Casa 1 · Juan',
      kind: 'PERIODIC',
      amount: '25.50',
      paidAt: new Date('2026-03-01'),
      frequency: 'QUARTERLY',
      periodYear: 2026,
      periodIndex: 1,
      paymentMethod: 'TRANSFER',
      notes: ''
    })

    const dto = payment.toDto()
    expect(dto.amount).toBe('25.5')
    expect(dto.frequency).toBe('QUARTERLY')
    expect(dto.number).toBe(1)
  })

  it('rejects periodic payment without period', () => {
    expect(() =>
      FeePayment.create({
        communityId: Id.generateUniqueId().toString(),
        number: 1,
        waterPointId: Id.generateUniqueId().toString(),
        payerLabel: 'Casa 1',
        kind: 'PERIODIC',
        amount: '25',
        paidAt: new Date(),
        frequency: null,
        periodYear: null,
        periodIndex: null,
        paymentMethod: 'CASH',
        notes: ''
      })
    ).toThrow()
  })
})
