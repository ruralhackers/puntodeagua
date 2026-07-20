import { Id } from '@pda/common/domain'
import { FeeConfig } from '../domain/entities/fee-config'
import type { FeeConfigUpsertDto } from '../domain/entities/fee-config.dto'
import type { FeeConfigRepository } from '../domain/repositories/fee-config.repository'

export class FeeConfigUpserter {
  constructor(private readonly feeConfigRepository: FeeConfigRepository) {}

  async run(params: { data: FeeConfigUpsertDto }) {
    const { data } = params
    const existing = await this.feeConfigRepository.findByCommunityId(
      Id.fromString(data.communityId)
    )

    if (existing) {
      existing.update({
        annualAmount: data.annualAmount,
        frequency: data.frequency,
        currency: data.currency
      })
      await this.feeConfigRepository.save(existing)
      return existing
    }

    const feeConfig = FeeConfig.create(data)
    await this.feeConfigRepository.save(feeConfig)
    return feeConfig
  }
}
