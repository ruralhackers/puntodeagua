import type { Id } from '@pda/common/domain'
import { BasePrismaRepository } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { FeeConfig } from '../../domain/entities/fee-config'
import type { FeeConfigRepository } from '../../domain/repositories/fee-config.repository'

export class FeeConfigPrismaRepository extends BasePrismaRepository implements FeeConfigRepository {
  protected readonly model = 'feeConfig'

  protected getModel() {
    return this.db.feeConfig
  }

  constructor(db: typeof prisma) {
    super(db)
  }

  async findById(id: Id) {
    const feeConfig = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return feeConfig ? FeeConfig.fromDto(this.fromPrismaPayload(feeConfig)) : undefined
  }

  async findByCommunityId(communityId: Id) {
    const feeConfig = await this.getModel().findUnique({
      where: { communityId: communityId.toString() }
    })
    return feeConfig ? FeeConfig.fromDto(this.fromPrismaPayload(feeConfig)) : undefined
  }

  async save(feeConfig: FeeConfig) {
    const update = {
      communityId: feeConfig.communityId.toString(),
      annualAmount: feeConfig.annualAmount.toString(),
      frequency: feeConfig.frequency.toString(),
      currency: feeConfig.currency,
      updatedAt: new Date()
    }

    await this.getModel().upsert({
      where: { id: feeConfig.id.toString() },
      create: {
        ...update,
        id: feeConfig.id.toString()
      },
      update
    })
  }

  private fromPrismaPayload(payload: Prisma.FeeConfigGetPayload<Record<string, never>>) {
    return {
      id: payload.id,
      communityId: payload.communityId,
      annualAmount: payload.annualAmount.toString(),
      frequency: payload.frequency,
      currency: payload.currency
    }
  }
}
