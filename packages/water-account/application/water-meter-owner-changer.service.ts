import { Id } from '@pda/common/domain'
import { WaterAccount } from '../domain/entities/water-account'
import type { WaterAccountRepository } from '../domain/repositories/water-account.repository'
import type { WaterMeterRepository } from '../domain/repositories/water-meter.repository'

interface ChangeOwnerParams {
  waterMeterId: Id
  newWaterAccountId?: Id
  newWaterAccountData?: {
    name: string
    nationalId: string
    notes?: string
  }
}

export class WaterMeterOwnerChanger {
  constructor(
    private waterMeterRepository: WaterMeterRepository,
    private waterAccountRepository: WaterAccountRepository
  ) {}

  async run(params: ChangeOwnerParams) {
    // Validar que el water meter existe
    const waterMeter = await this.waterMeterRepository.findById(params.waterMeterId)
    if (!waterMeter) {
      throw new Error('Water meter not found')
    }

    let newWaterAccountId: Id

    // Si se proporciona un ID, usar ese account
    if (params.newWaterAccountId) {
      const existingAccount = await this.waterAccountRepository.findById(params.newWaterAccountId)
      if (!existingAccount) {
        throw new Error('Water account not found')
      }
      newWaterAccountId = params.newWaterAccountId
    }
    // Si no, crear uno nuevo
    else if (params.newWaterAccountData) {
      const newAccount = WaterAccount.create(params.newWaterAccountData)
      await this.waterAccountRepository.save(newAccount)
      newWaterAccountId = newAccount.id
    } else {
      throw new Error('Must provide either newWaterAccountId or newWaterAccountData')
    }

    // Cambiar el owner del water meter
    waterMeter.changeOwner(newWaterAccountId)
    await this.waterMeterRepository.save(waterMeter)

    return {
      waterMeterId: waterMeter.id.toString(),
      newWaterAccountId: newWaterAccountId.toString()
    }
  }
}

