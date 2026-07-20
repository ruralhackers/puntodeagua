import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { WaterAccountUpdater } from '../../application/water-account-updater.service'
import { WaterAccount } from '../../domain/entities/water-account'
import { WaterAccountNotFoundError } from '../../domain/errors/water-meter-errors'
import type { WaterAccountRepository } from '../../domain/repositories/water-account.repository'
import { createMockWaterAccountRepository } from '../helpers/mocks'

describe('WaterAccountUpdater', () => {
  let service: WaterAccountUpdater
  let repo: WaterAccountRepository

  beforeEach(() => {
    repo = createMockWaterAccountRepository()
    service = new WaterAccountUpdater(repo)
  })

  it('updates name, nationalId, phone and notes', async () => {
    const account = WaterAccount.fromDto({
      id: Id.generateUniqueId().toString(),
      name: 'Old Name',
      nationalId: '11111111A',
      notes: 'old'
    })
    repo.findById = mock().mockResolvedValue(account)
    repo.save = mock().mockResolvedValue(undefined)

    const result = await service.run({
      id: account.id,
      data: {
        name: 'New Name',
        nationalId: '22222222B',
        phone: '666123456',
        notes: 'updated'
      }
    })

    expect(result.name).toBe('New Name')
    expect(result.nationalId).toBe('22222222B')
    expect(result.phone).toBe('666123456')
    expect(result.notes).toBe('updated')
    expect(repo.save).toHaveBeenCalledWith(account)
  })

  it('clears phone when empty string is provided', async () => {
    const account = WaterAccount.fromDto({
      id: Id.generateUniqueId().toString(),
      name: 'Name',
      nationalId: '11111111A',
      phone: '666000000'
    })
    repo.findById = mock().mockResolvedValue(account)
    repo.save = mock().mockResolvedValue(undefined)

    const result = await service.run({
      id: account.id,
      data: {
        name: 'Name',
        nationalId: '11111111A',
        phone: '  '
      }
    })

    expect(result.phone).toBeUndefined()
  })

  it('throws when account does not exist', async () => {
    repo.findById = mock().mockResolvedValue(undefined)

    await expect(
      service.run({
        id: Id.generateUniqueId(),
        data: { name: 'X', nationalId: 'Y' }
      })
    ).rejects.toBeInstanceOf(WaterAccountNotFoundError)
  })
})
