import type { Email, Id, TableQueryParams, TableQueryResult } from '@pda/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
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

  async findById(id: Id) {
    const user = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return user ? User.fromDto(user) : undefined
  }

  async save(user: User) {
    await this.getModel().update({
      where: {
        id: user.id.toString()
      },
      update: {
        roles: user.roles.map((role) => role.toString()),
        name: user.name,
        passwordHash: user.passwordHash,
        emailVerified: user.emailVerified,
        updatedAt: new Date()
      }
    })
  }

  async delete(id: Id) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  protected getModel() {
    return this.db[this.model]
  }
}
