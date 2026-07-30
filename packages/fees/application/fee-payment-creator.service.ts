import { Id } from '@pda/common/domain'
import type { WaterPointRepository } from '@pda/community/domain'
import { FeePayment } from '../domain/entities/fee-payment'
import type { FeePaymentCreateDto } from '../domain/entities/fee-payment.dto'
import { WaterPointNotInCommunityError } from '../domain/errors/fee-errors'
import type { FeePaymentRepository } from '../domain/repositories/fee-payment.repository'

export class FeePaymentCreator {
  constructor(
    private readonly feePaymentRepository: FeePaymentRepository,
    private readonly waterPointRepository: WaterPointRepository
  ) {}

  async run(params: { data: FeePaymentCreateDto }) {
    const { data } = params
    await this.assertWaterPointInCommunity(data.waterPointId, data.communityId)

    return this.feePaymentRepository.createWithNextNumber(
      Id.fromString(data.communityId),
      (number) => FeePayment.create({ ...data, number })
    )
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
