import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import type { WaterPointRepository } from '@pda/community/domain'
import { FeePaymentCreator } from '../../application/fee-payment-creator.service'
import { WaterPointNotInCommunityError } from '../../domain/errors/fee-errors'
import type { FeePaymentRepository } from '../../domain/repositories/fee-payment.repository'

function createMocks() {
  const feePaymentRepository: FeePaymentRepository = {
    findById: mock(),
    findByCommunityId: mock(),
    getNextNumber: mock(),
    createWithNextNumber: mock(),
    save: mock(),
    delete: mock()
  }
  const waterPointRepository: WaterPointRepository = {
    findById: mock(),
    findByCommunityZonesId: mock(),
    findByCommunityZonesIdWithAccount: mock(),
    findByCommunityIdWithAccount: mock(),
    findForTable: mock(),
    save: mock(),
    delete: mock()
  }
  return { feePaymentRepository, waterPointRepository }
}

describe('FeePaymentCreator', () => {
  let service: FeePaymentCreator
  let feePaymentRepository: FeePaymentRepository
  let waterPointRepository: WaterPointRepository
  const communityId = Id.generateUniqueId().toString()
  const waterPointId = Id.generateUniqueId().toString()

  beforeEach(() => {
    const mocks = createMocks()
    feePaymentRepository = mocks.feePaymentRepository
    waterPointRepository = mocks.waterPointRepository
    service = new FeePaymentCreator(feePaymentRepository, waterPointRepository)
  })

  it('creates periodic payment with next number', async () => {
    waterPointRepository.findByCommunityIdWithAccount = mock().mockResolvedValue([
      { id: waterPointId, name: 'Casa 1', waterAccountName: 'Juan' }
    ])
    feePaymentRepository.createWithNextNumber = mock().mockImplementation(
      async (_communityId: Id, build: (number: number) => unknown) => build(7)
    )

    const result = await service.run({
      data: {
        communityId,
        waterPointId,
        payerLabel: 'Casa 1 · Juan',
        kind: 'PERIODIC',
        amount: '25.00',
        paidAt: new Date('2026-01-15'),
        frequency: 'QUARTERLY',
        periodYear: 2026,
        periodIndex: 1,
        paymentMethod: 'TRANSFER',
        notes: ''
      }
    })

    expect(result.number).toBe(7)
    expect(result.kind.toString()).toBe('PERIODIC')
    expect(result.amount.toString()).toBe('25')
    expect(feePaymentRepository.createWithNextNumber).toHaveBeenCalled()
  })

  it('creates sanction without period fields', async () => {
    waterPointRepository.findByCommunityIdWithAccount = mock().mockResolvedValue([
      { id: waterPointId, name: 'Casa 1', waterAccountName: null }
    ])
    feePaymentRepository.createWithNextNumber = mock().mockImplementation(
      async (_communityId: Id, build: (number: number) => unknown) => build(1)
    )

    const result = await service.run({
      data: {
        communityId,
        waterPointId,
        payerLabel: 'Casa 1',
        kind: 'SANCTION',
        amount: '50',
        paidAt: new Date('2026-01-15'),
        frequency: null,
        periodYear: null,
        periodIndex: null,
        paymentMethod: 'CASH',
        notes: 'Retraso'
      }
    })

    expect(result.kind.toString()).toBe('SANCTION')
    expect(result.frequency).toBeNull()
    expect(result.periodYear).toBeNull()
  })

  it('rejects water point outside community', async () => {
    waterPointRepository.findByCommunityIdWithAccount = mock().mockResolvedValue([])

    await expect(
      service.run({
        data: {
          communityId,
          waterPointId,
          payerLabel: 'Casa 1',
          kind: 'EXTRA',
          amount: '10',
          paidAt: new Date('2026-01-15'),
          frequency: null,
          periodYear: null,
          periodIndex: null,
          paymentMethod: 'CASH',
          notes: ''
        }
      })
    ).rejects.toBeInstanceOf(WaterPointNotInCommunityError)
  })
})
