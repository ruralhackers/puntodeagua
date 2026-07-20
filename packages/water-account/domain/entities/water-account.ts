import { Id } from '@pda/common/domain'
import type { WaterAccountDto, WaterAccountUpdateDto } from './water-account.dto'
import { waterAccountUpdateSchema } from './water-account.dto'

export class WaterAccount {
  private constructor(
    public readonly id: Id,
    public name: string,
    public nationalId: string,
    public phone?: string,
    public notes?: string
  ) {}

  static create(dto: Omit<WaterAccountDto, 'id'>) {
    return new WaterAccount(
      Id.generateUniqueId(),
      dto.name,
      dto.nationalId,
      normalizeOptionalString(dto.phone),
      dto.notes
    )
  }

  static fromDto(dto: WaterAccountDto) {
    return new WaterAccount(
      Id.fromString(dto.id),
      dto.name,
      dto.nationalId,
      normalizeOptionalString(dto.phone),
      dto.notes
    )
  }

  update(data: WaterAccountUpdateDto) {
    const validated = waterAccountUpdateSchema.parse(data)
    this.name = validated.name
    this.nationalId = validated.nationalId
    this.phone = normalizeOptionalString(validated.phone)
    this.notes = validated.notes
    return this
  }

  toDto(): WaterAccountDto {
    return {
      id: this.id.toString(),
      name: this.name,
      nationalId: this.nationalId,
      phone: this.phone,
      notes: this.notes
    }
  }
}

function normalizeOptionalString(value: string | undefined) {
  if (!value || !value.trim()) return undefined
  return value.trim()
}
