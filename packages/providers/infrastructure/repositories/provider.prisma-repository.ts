import type { Id, TableQueryParams, TableQueryResult } from '@pda/common/domain'
import { BasePrismaRepository, PrismaTableQueryBuilder } from '@pda/common/infrastructure'
import type { Prisma, client as prisma } from '@pda/database'
import { Provider } from '../../domain/entities/provider'
import type { ProviderRepository } from '../../domain/repositories/provider.repository'
import { providerTableConfig } from './provider-table-config'

export class ProviderPrismaRepository extends BasePrismaRepository implements ProviderRepository {
  protected readonly model = 'provider'
  private readonly tableBuilder: PrismaTableQueryBuilder<Provider, Provider>
  protected getModel() {
    return this.db[this.model]
  }

  constructor(db: typeof prisma) {
    super(db)
    const customConfig = {
      ...providerTableConfig,
      entityFromDto: (dto: Prisma.ProviderGetPayload<null>) =>
        Provider.fromDto(this.fromPrismaPayload(dto))
    }
    this.tableBuilder = new PrismaTableQueryBuilder(customConfig, db, this.model)
  }

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<Provider>> {
    return this.tableBuilder.findForTable(params)
  }

  async findAll(): Promise<Provider[]> {
    const providers = await this.getModel().findMany()
    return providers.map((provider) => Provider.fromDto(this.fromPrismaPayload(provider)))
  }

  async findById(id: Id) {
    const provider = await this.getModel().findUnique({
      where: { id: id.toString() }
    })
    return provider ? Provider.fromDto(this.fromPrismaPayload(provider)) : undefined
  }

  async findByCommunityId(communityId: Id) {
    const providers = await this.getModel().findMany({
      where: { communityId: communityId.toString() },
      orderBy: { companyName: 'asc' }
    })
    return providers.map((provider) => Provider.fromDto(this.fromPrismaPayload(provider)))
  }

  async save(provider: Provider) {
    const update = {
      companyName: provider.companyName,
      taxId: provider.taxId ?? undefined,
      contactPerson: provider.contactPerson,
      contactPhone: provider.contactPhone,
      contactEmail: provider.contactEmail ?? undefined,
      secondaryPhone: provider.secondaryPhone ?? undefined,
      billingEmail: provider.billingEmail ?? undefined,
      address: provider.address ?? undefined,
      city: provider.city ?? undefined,
      postalCode: provider.postalCode ?? undefined,
      province: provider.province ?? undefined,
      providerType: provider.providerType.toString(),
      customProviderType: provider.customProviderType ?? undefined,
      isActive: provider.isActive,
      notes: provider.notes ?? undefined,
      businessHours: provider.businessHours ?? undefined,
      emergencyAvailable: provider.emergencyAvailable,
      emergencyPhone: provider.emergencyPhone ?? undefined,
      bankAccount: provider.bankAccount ?? undefined,
      paymentTerms: provider.paymentTerms ?? undefined,
      website: provider.website ?? undefined,
      communityId: provider.communityId?.toString() ?? undefined,
      updatedAt: new Date()
    }

    await this.getModel().upsert({
      where: {
        id: provider.id.toString()
      },
      create: {
        ...update,
        id: provider.id.toString()
      },
      update
    })
  }

  async delete(id: Id) {
    await this.getModel().delete({
      where: { id: id.toString() }
    })
  }

  private fromPrismaPayload(payload: Prisma.ProviderGetPayload<Record<string, never>>) {
    return {
      ...payload,
      taxId: payload.taxId ?? undefined,
      contactEmail: payload.contactEmail ?? undefined,
      secondaryPhone: payload.secondaryPhone ?? undefined,
      billingEmail: payload.billingEmail ?? undefined,
      address: payload.address ?? undefined,
      city: payload.city ?? undefined,
      postalCode: payload.postalCode ?? undefined,
      province: payload.province ?? undefined,
      customProviderType: payload.customProviderType ?? undefined,
      notes: payload.notes ?? undefined,
      businessHours: payload.businessHours ?? undefined,
      emergencyPhone: payload.emergencyPhone ?? undefined,
      bankAccount: payload.bankAccount ?? undefined,
      paymentTerms: payload.paymentTerms ?? undefined,
      website: payload.website ?? undefined,
      communityId: payload.communityId ?? undefined
    }
  }
}
