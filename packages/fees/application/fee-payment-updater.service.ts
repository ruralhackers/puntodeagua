import { Id } from '@pda/common/domain'
import type { WaterPointRepository } from '@pda/community/domain'
import type { FeePaymentUpdateDto } from '../domain/entities/fee-payment.dto'
import { FeePaymentNotFoundError, WaterPointNotInCommunityError } from '../domain/errors/fee-errors'
import type { FeePaymentRepository } from '../domain/repositories/fee-payment.repository'

export class FeePaymentUpdater {
  constructor(
    private readonly feePaymentRepository: FeePaymentRepository,
    private readonly waterPointRepository: WaterPointRepository
  ) {}

  async run(params: { id: Id; data: FeePaymentUpdateDto }) {
    const { id, data } = params
    const payment = await this.feePaymentRepository.findById(id)
    if (!payment) {
      throw new FeePaymentNotFoundError()
    }

    await this.assertWaterPointInCommunity(data.waterPointId, payment.communityId.toString())

    payment.update(data)
    await this.feePaymentRepository.save(payment)
    return payment
  }

  private async assertWaterPointInCommunity(waterPointId: string, communityId: string) {
    const points = await this.waterPointRepository.findByCommunityIdWithAccount(
      Id.fromString(communityId)
    )
    const belongs = points.some((point) => point.id === waterPointId)
    if (!belongs) {
      throw new WaterPointNotInCommunityError()
    }
  }
}
