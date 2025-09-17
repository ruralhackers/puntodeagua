import { Id } from '@pda/common/domain'
import type { WaterAccountDto } from './water-account.dto'

export class WaterAccount {
  private constructor(
    public readonly id: Id,
    public name: string,
    public nationalId: string,
    public notes?: string
  ) {}

  static create(dto: Omit<WaterAccountDto, 'id'>) {
    return new WaterAccount(Id.generateUniqueId(), dto.name, dto.nationalId, dto.notes)
  }

  static fromDto(dto: WaterAccountDto) {
    return new WaterAccount(Id.fromString(dto.id), dto.name, dto.nationalId, dto.notes)
  }

  toDto(): WaterAccountDto {
    return {
      id: this.id.toString(),
      name: this.name,
      nationalId: this.nationalId,
      notes: this.notes
    }
  }
}
