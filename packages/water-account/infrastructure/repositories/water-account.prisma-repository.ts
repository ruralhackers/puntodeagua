import type { Id } from '@pda/common/domain'
import { BasePrismaRepository } from '@pda/common/infrastructure'
import type { client as prisma } from '@pda/database'
import { WaterAccount } from '../../domain/entities/water-account'
import type { WaterAccountDto } from '../../domain/entities/water-account.dto'
import type { WaterAccountRepository } from '../../domain/repositories/water-account.repository'

export class WaterAccountPrismaRepository
  extends BasePrismaRepository
  implements WaterAccountRepository
{
  protected readonly model = 'waterAccount'

  constructor(db: typeof prisma) {
    super(db)
  }

  protected getModel() {
    return this.db.waterAccount
  }

  async findById(id: Id): Promise<WaterAccount | undefined> {
    const account = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    if (!account) return undefined
    return WaterAccount.fromDto(this.fromPrismaPayload(account))
  }

  async findAll(): Promise<WaterAccount[]> {
    const accounts = await this.getModel().findMany({
      orderBy: { name: 'asc' }
    })
    return accounts.map((account) => WaterAccount.fromDto(this.fromPrismaPayload(account)))
  }

  async findByCommunityId(communityId: Id): Promise<WaterAccount[]> {
    const accounts = await this.getModel().findMany({
      where: {
        waterMeters: {
          some: {
            waterPoint: {
              communityZone: {
                communityId: communityId.toString()
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    return accounts.map((account) => WaterAccount.fromDto(this.fromPrismaPayload(account)))
  }

  async belongsToCommunity(id: Id, communityId: Id): Promise<boolean> {
    const count = await this.getModel().count({
      where: {
        id: id.toString(),
        waterMeters: {
          some: {
            waterPoint: {
              communityZone: {
                communityId: communityId.toString()
              }
            }
          }
        }
      }
    })
    return count > 0
  }

  async save(waterAccount: WaterAccount): Promise<void> {
    const dto = waterAccount.toDto()
    await this.getModel().upsert({
      where: { id: dto.id },
      create: {
        id: dto.id,
        name: dto.name,
        nationalId: dto.nationalId,
        phone: dto.phone ?? null,
        notes: dto.notes
      },
      update: {
        name: dto.name,
        nationalId: dto.nationalId,
        phone: dto.phone ?? null,
        notes: dto.notes,
        updatedAt: new Date()
      }
    })
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  async findForTable(): Promise<any> {
    throw new Error('Not implemented')
  }

  private fromPrismaPayload(account: {
    id: string
    name: string
    nationalId: string
    phone: string | null
    notes: string
  }): WaterAccountDto {
    return {
      id: account.id,
      name: account.name,
      nationalId: account.nationalId,
      phone: account.phone ?? undefined,
      notes: account.notes
    }
  }
}
