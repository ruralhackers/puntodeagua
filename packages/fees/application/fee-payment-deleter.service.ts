import type { Id } from '@pda/common/domain'
import { FeePaymentNotFoundError } from '../domain/errors/fee-errors'
import type { FeePaymentRepository } from '../domain/repositories/fee-payment.repository'

export class FeePaymentDeleter {
  constructor(private readonly feePaymentRepository: FeePaymentRepository) {}

  async run(params: { id: Id }) {
    const { id } = params
    const payment = await this.feePaymentRepository.findById(id)
    if (!payment) {
      throw new FeePaymentNotFoundError()
    }
    await this.feePaymentRepository.delete(id)
  }
}
