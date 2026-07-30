import type { Id } from '@pda/common/domain'
import type { WaterDepositRepository } from '../domain/repositories/water-deposit.repository'

interface UpdateWaterDepositParams {
  id: Id
  communityId: Id
  updatedData: {
    name?: string
    location?: string
    notes?: string
  }
}

export class WaterDepositUpdater {
  constructor(private readonly waterDepositRepository: WaterDepositRepository) {}

  async run(params: UpdateWaterDepositParams) {
    const waterDeposit = await this.waterDepositRepository.findById(params.id)
    if (!waterDeposit) {
      throw new Error('Water deposit not found')
    }

    // A community admin must never be able to touch another community's deposit
    if (!waterDeposit.communityId.equals(params.communityId)) {
      throw new Error('Water deposit does not belong to this community')
    }

    if (params.updatedData.name !== undefined) {
      const trimmedName = params.updatedData.name.trim()
      if (!trimmedName) {
        throw new Error('Name cannot be empty')
      }
      waterDeposit.name = trimmedName
    }

    if (params.updatedData.location !== undefined) {
      waterDeposit.location = params.updatedData.location.trim()
    }

    if (params.updatedData.notes !== undefined) {
      waterDeposit.notes = params.updatedData.notes
    }

    await this.waterDepositRepository.save(waterDeposit)

    return waterDeposit
  }
}
