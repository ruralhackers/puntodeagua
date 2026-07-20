import type { Id } from '@pda/common/domain'
import type { FeeConfigRepository } from '../domain/repositories/fee-config.repository'
import { FEE_CONFIG_DEFAULTS } from '../domain/value-objects/fee-defaults'

export class FeeConfigFinder {
  constructor(private readonly feeConfigRepository: FeeConfigRepository) {}

  async run(communityId: Id) {
    const existing = await this.feeConfigRepository.findByCommunityId(communityId)
    if (existing) {
      return {
        exists: true as const,
        config: existing.toDto()
      }
    }

    return {
      exists: false as const,
      config: {
        id: '',
        communityId: communityId.toString(),
        annualAmount: FEE_CONFIG_DEFAULTS.annualAmount,
        frequency: FEE_CONFIG_DEFAULTS.frequency,
        currency: FEE_CONFIG_DEFAULTS.currency
      }
    }
  }
}
