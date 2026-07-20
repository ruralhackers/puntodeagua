import type { FeePaymentListFilters } from '../domain/repositories/fee-payment.repository'
import type { FeePaymentRepository } from '../domain/repositories/fee-payment.repository'

export class FeePaymentFinder {
  constructor(private readonly feePaymentRepository: FeePaymentRepository) {}

  async run(filters: FeePaymentListFilters) {
    return this.feePaymentRepository.findByCommunityId(filters)
  }

  async byId(id: Parameters<FeePaymentRepository['findById']>[0]) {
    return this.feePaymentRepository.findById(id)
  }
}
