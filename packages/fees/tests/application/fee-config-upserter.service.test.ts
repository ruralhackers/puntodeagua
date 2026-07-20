import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Id } from '@pda/common/domain'
import { FeeConfigUpserter } from '../../application/fee-config-upserter.service'
import { FeeConfig } from '../../domain/entities/fee-config'
import type { FeeConfigRepository } from '../../domain/repositories/fee-config.repository'

function createMockFeeConfigRepository(): FeeConfigRepository {
  return {
    findById: mock(),
    findByCommunityId: mock(),
    save: mock()
  }
}

describe('FeeConfigUpserter', () => {
  let service: FeeConfigUpserter
  let repo: FeeConfigRepository

  beforeEach(() => {
    repo = createMockFeeConfigRepository()
    service = new FeeConfigUpserter(repo)
  })

  it('creates config when none exists', async () => {
    repo.findByCommunityId = mock().mockResolvedValue(undefined)
    repo.save = mock().mockResolvedValue(undefined)

    const result = await service.run({
      data: {
        communityId: Id.generateUniqueId().toString(),
        annualAmount: '120',
        frequency: 'QUARTERLY',
        currency: 'EUR'
      }
    })

    expect(result.annualAmount.toString()).toBe('120')
    expect(result.frequency.toString()).toBe('QUARTERLY')
    expect(repo.save).toHaveBeenCalled()
  })

  it('updates existing config', async () => {
    const existing = FeeConfig.create({
      communityId: Id.generateUniqueId().toString(),
      annualAmount: '100',
      frequency: 'ANNUAL',
      currency: 'EUR'
    })
    repo.findByCommunityId = mock().mockResolvedValue(existing)
    repo.save = mock().mockResolvedValue(undefined)

    const result = await service.run({
      data: {
        communityId: existing.communityId.toString(),
        annualAmount: '200',
        frequency: 'MONTHLY',
        currency: 'EUR'
      }
    })

    expect(result.id.toString()).toBe(existing.id.toString())
    expect(result.annualAmount.toString()).toBe('200')
    expect(result.frequency.toString()).toBe('MONTHLY')
  })
})
