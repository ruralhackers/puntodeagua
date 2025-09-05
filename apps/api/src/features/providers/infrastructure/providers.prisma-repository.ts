import type { Id } from 'core'
import type { Prisma, PrismaClient } from 'database'
import { BasePrismaRepository, Provider, type ProviderRepository } from 'features'

export class ProvidersPrismaRepository extends BasePrismaRepository implements ProviderRepository {
  protected readonly model = 'provider'
  protected getModel(): PrismaClient['provider'] {
    return this.db.provider
  }

  async save(input: Provider): Promise<void> {
    const update = {
      name: input.name,
      communityId: input.communityId,
      phone: input.phone ?? undefined,
      description: input.description ?? undefined
    }
    const create = { ...update, id: input.id }

    await this.getModel().upsert({
      where: { id: input.id },
      create,
      update
    })
  }

  async findById(id: Id): Promise<Provider | undefined> {
    const entityDto = await this.getModel().findUnique({ where: { id: id.toString() } })
    return entityDto ? Provider.fromDto(this.fromPrismaPayload(entityDto)) : undefined
  }

  async findAll(): Promise<Provider[]> {
    const entityDtos = await this.getModel().findMany()
    return entityDtos.map((c) => Provider.fromDto(this.fromPrismaPayload(c)))
  }

  async delete(id: Id): Promise<void> {
    await this.getModel().delete({ where: { id: id.toString() } })
  }

  private fromPrismaPayload(input: Prisma.ProviderGetPayload<true>) {
    return {
      id: input.id,
      communityId: input.communityId,
      name: input.name,
      phone: input.phone ?? undefined,
      description: input.description ?? undefined
    }
  }
}
