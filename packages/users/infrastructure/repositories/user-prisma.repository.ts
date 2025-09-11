import type { Email, TableQueryParams, TableQueryResult, Uuid } from '@ph/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@ph/common/infrastructure'
import type { Prisma, client as prisma } from '@ph/database'
import { User } from '../../domain/entities/user'
import type { UserRepository } from '../../domain/repositories/user-repository'
import { userTableConfig } from './user-table-config'

export class UserPrismaRepository extends BasePrismaRepository implements UserRepository {
  protected readonly model = 'user'
  private readonly tableBuilder: PrismaTableQueryBuilder<User, User>

  constructor(db: typeof prisma) {
    super(db)
    const customConfig = {
      ...userTableConfig,
      entityFromDto: (dto: Prisma.UserGetPayload<null>) => User.fromDto(dto)
    }
    this.tableBuilder = new PrismaTableQueryBuilder(customConfig, db, this.model)
  }

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<User>> {
    return this.tableBuilder.findForTable(params)
  }

  async findByEmail(email: Email) {
    const user = await this.getModel().findUnique({
      where: { email: email.toString() }
    })
    return user ? User.fromDto(user) : undefined
  }

  async findById(id: Uuid) {
    const user = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return user ? User.fromDto(user) : undefined
  }

  async save(user: User) {
    const update = user.toDto() as Prisma.UserUpdateInput
    delete update.id
    delete update.createdAt
    delete update.updatedAt

    await this.getModel().upsert({
      where: {
        id: user.id.toString()
      },
      create: user.toDto() as Prisma.UserCreateInput,
      update
    })
  }

  async delete(id: Uuid) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  protected getModel() {
    return this.db[this.model]
  }
}
