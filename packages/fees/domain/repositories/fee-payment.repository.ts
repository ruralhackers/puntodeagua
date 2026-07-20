import type { Deletable, FindableById, Id, Savable } from '@pda/common/domain'
import type { FeePayment } from '../entities/fee-payment'

export type FeePaymentListFilters = {
  communityId: Id
  waterPointId?: Id
  year?: number
  kind?: string
  paidAtFrom?: Date
  paidAtTo?: Date
}

export interface FeePaymentRepository
  extends FindableById<FeePayment>,
    Savable<FeePayment>,
    Deletable<FeePayment> {
  findById(id: Id): Promise<FeePayment | undefined>
  findByCommunityId(filters: FeePaymentListFilters): Promise<FeePayment[]>
  getNextNumber(communityId: Id): Promise<number>
  createWithNextNumber(
    communityId: Id,
    build: (number: number) => FeePayment
  ): Promise<FeePayment>
  save(feePayment: FeePayment): Promise<void>
  delete(id: Id): Promise<void>
}
