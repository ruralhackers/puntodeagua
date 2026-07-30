import type { WaterDeposit } from '../domain/entities/water-deposit'
import type { WaterDepositRepository } from '../domain/repositories/water-deposit.repository'

interface CreateWaterDepositParams {
  deposit: WaterDeposit
}

export class WaterDepositCreator {
  constructor(private readonly waterDepositRepository: WaterDepositRepository) {}

  async run(params: CreateWaterDepositParams) {
    const { deposit } = params

    const trimmedName = deposit.name.trim()
    if (!trimmedName) {
      throw new Error('Name cannot be empty')
    }

    deposit.name = trimmedName
    deposit.location = deposit.location.trim()

    await this.waterDepositRepository.save(deposit)

    return deposit
  }
}
