import { Id } from 'core'
import type { HolderSchema } from '../schemas/holder.schema.ts'
import type { HolderDto } from './holder.dto.ts'

export class Holder {
  private constructor(
    public readonly id: Id,
    public name: string,
    public nationalId: string, // DNI (Documento Nacional de Identidad)
    public cadastralReference: string, // referencia catastral
    public description?: string // descripción
  ) {}

  static create(holderSchema: Omit<HolderSchema, 'id'>) {
    return new Holder(
      Id.generateUniqueId(),
      holderSchema.name,
      holderSchema.nationalId, // ensure HolderSchema has this field
      holderSchema.cadastralReference,
      holderSchema.description
    )
  }

  static fromDto(dto: HolderDto) {
    return new Holder(
      Id.create(dto.id),
      dto.name,
      dto.nationalId,
      dto.cadastralReference,
      dto.description || undefined
    )
  }

  toDto() {
    return {
      id: this.id.toString(),
      name: this.name,
      nationalId: this.nationalId,
      cadastralReference: this.cadastralReference,
      description: this.description
    }
  }
}
