import { Id } from '@pda/common/domain'
import { ProviderType } from '../value-objects/provider-type'
import type { ProviderDto, ProviderUpdateDto } from './provider.dto'
import { providerSchema, providerUpdateSchema } from './provider.dto'

export class Provider {
  private constructor(
    public readonly id: Id,
    public readonly companyName: string,
    public readonly taxId: string | undefined,
    public readonly contactPerson: string,
    public readonly contactPhone: string,
    public readonly contactEmail: string | undefined,
    public readonly secondaryPhone: string | undefined,
    public readonly billingEmail: string | undefined,
    public readonly address: string | undefined,
    public readonly city: string | undefined,
    public readonly postalCode: string | undefined,
    public readonly province: string | undefined,
    public providerType: ProviderType,
    public isActive: boolean,
    public notes: string | undefined,
    public readonly businessHours: string | undefined,
    public readonly emergencyAvailable: boolean,
    public readonly emergencyPhone: string | undefined,
    public readonly bankAccount: string | undefined,
    public readonly paymentTerms: string | undefined,
    public readonly website: string | undefined,
    public readonly communityId: Id | undefined
  ) {}

  static create(providerData: Omit<ProviderDto, 'id'>) {
    // Validate using Zod schema
    const validatedData = providerSchema.parse({ ...providerData, id: 'temp' }) as ProviderDto

    const providerType = ProviderType.fromString(validatedData.providerType)

    return new Provider(
      Id.generateUniqueId(),
      validatedData.companyName,
      validatedData.taxId,
      validatedData.contactPerson,
      validatedData.contactPhone,
      validatedData.contactEmail || undefined,
      validatedData.secondaryPhone,
      validatedData.billingEmail || undefined,
      validatedData.address,
      validatedData.city,
      validatedData.postalCode,
      validatedData.province,
      providerType,
      validatedData.isActive,
      validatedData.notes,
      validatedData.businessHours,
      validatedData.emergencyAvailable,
      validatedData.emergencyPhone,
      validatedData.bankAccount,
      validatedData.paymentTerms,
      validatedData.website || undefined,
      validatedData.communityId ? Id.fromString(validatedData.communityId) : undefined
    )
  }

  static fromDto(dto: ProviderDto): Provider {
    return new Provider(
      Id.fromString(dto.id),
      dto.companyName,
      dto.taxId,
      dto.contactPerson,
      dto.contactPhone,
      dto.contactEmail || undefined,
      dto.secondaryPhone,
      dto.billingEmail || undefined,
      dto.address,
      dto.city,
      dto.postalCode,
      dto.province,
      ProviderType.fromString(dto.providerType),
      dto.isActive,
      dto.notes,
      dto.businessHours,
      dto.emergencyAvailable,
      dto.emergencyPhone,
      dto.bankAccount,
      dto.paymentTerms,
      dto.website || undefined,
      dto.communityId ? Id.fromString(dto.communityId) : undefined
    )
  }

  public update(providerData: ProviderUpdateDto): Provider {
    // Validate using Zod schema
    const validatedData = providerUpdateSchema.parse(providerData) as ProviderUpdateDto

    const providerType = ProviderType.fromString(validatedData.providerType)

    this.providerType = providerType
    this.isActive = validatedData.isActive
    this.notes = validatedData.notes

    return this
  }

  toDto(): ProviderDto {
    return {
      id: this.id.toString(),
      companyName: this.companyName,
      taxId: this.taxId,
      contactPerson: this.contactPerson,
      contactPhone: this.contactPhone,
      contactEmail: this.contactEmail,
      secondaryPhone: this.secondaryPhone,
      billingEmail: this.billingEmail,
      address: this.address,
      city: this.city,
      postalCode: this.postalCode,
      province: this.province,
      providerType: this.providerType.toString(),
      isActive: this.isActive,
      notes: this.notes,
      businessHours: this.businessHours,
      emergencyAvailable: this.emergencyAvailable,
      emergencyPhone: this.emergencyPhone,
      bankAccount: this.bankAccount,
      paymentTerms: this.paymentTerms,
      website: this.website,
      communityId: this.communityId?.toString()
    }
  }
}
