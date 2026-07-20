import { Decimal, Id } from '@pda/common/domain'
import { FeeFrequency } from '../value-objects/fee-frequency'
import type { FeeConfigDto, FeeConfigUpsertDto } from './fee-config.dto'
import { feeConfigSchema, feeConfigUpsertSchema } from './fee-config.dto'

export class FeeConfig {
  private constructor(
    public readonly id: Id,
    public readonly communityId: Id,
    public annualAmount: Decimal,
    public frequency: FeeFrequency,
    public currency: string
  ) {}

  static create(data: FeeConfigUpsertDto) {
    const validated = feeConfigUpsertSchema.parse(data)
    return new FeeConfig(
      Id.generateUniqueId(),
      Id.fromString(validated.communityId),
      Decimal.fromString(validated.annualAmount),
      FeeFrequency.fromString(validated.frequency),
      validated.currency || 'EUR'
    )
  }

  static fromDto(dto: FeeConfigDto): FeeConfig {
    const validated = feeConfigSchema.parse(dto)
    return new FeeConfig(
      Id.fromString(validated.id),
      Id.fromString(validated.communityId),
      Decimal.fromString(validated.annualAmount),
      FeeFrequency.fromString(validated.frequency),
      validated.currency
    )
  }

  update(data: Omit<FeeConfigUpsertDto, 'communityId'>) {
    const validated = feeConfigUpsertSchema.parse({
      ...data,
      communityId: this.communityId.toString()
    })
    this.annualAmount = Decimal.fromString(validated.annualAmount)
    this.frequency = FeeFrequency.fromString(validated.frequency)
    this.currency = validated.currency || 'EUR'
    return this
  }

  toDto(): FeeConfigDto {
    return {
      id: this.id.toString(),
      communityId: this.communityId.toString(),
      annualAmount: this.annualAmount.toString(),
      frequency: this.frequency.toString(),
      currency: this.currency
    }
  }
}
