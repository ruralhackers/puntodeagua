import type { Id } from '@pda/common/domain'
import type { WaterAccountUpdateDto } from '../domain/entities/water-account.dto'
import { WaterAccountNotFoundError } from '../domain/errors/water-meter-errors'
import type { WaterAccountRepository } from '../domain/repositories/water-account.repository'

export class WaterAccountUpdater {
  constructor(private readonly waterAccountRepository: WaterAccountRepository) {}

  async run(params: { id: Id; data: WaterAccountUpdateDto }) {
    const account = await this.waterAccountRepository.findById(params.id)
    if (!account) {
      throw new WaterAccountNotFoundError()
    }

    account.update(params.data)
    await this.waterAccountRepository.save(account)
    return account
  }
}
