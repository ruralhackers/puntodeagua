import type { Id } from '@pda/common/domain'
import { BasePrismaRepository } from '@pda/common/infrastructure'
import type { client as prisma } from '@pda/database'
import { WaterAccount } from '../../domain/entities/water-account'
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
    return this.db[this.model]
  }

  async findById(id: Id): Promise<WaterAccount | undefined> {
    const account = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    if (!account) return undefined
    return WaterAccount.fromDto(account)
  }

  async findAll(): Promise<WaterAccount[]> {
    const accounts = await this.getModel().findMany({
      orderBy: { name: 'asc' }
    })
    return accounts.map((account) => WaterAccount.fromDto(account))
  }

  async save(waterAccount: WaterAccount): Promise<void> {
    const dto = waterAccount.toDto()
    await this.getModel().upsert({
      where: { id: dto.id },
      create: {
        id: dto.id,
        name: dto.name,
        nationalId: dto.nationalId,
        notes: dto.notes
      },
      update: {
        name: dto.name,
        nationalId: dto.nationalId,
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
}

