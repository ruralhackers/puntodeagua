import type { ProviderSchema } from '../schemas/provider.schema'

export class Provider {
  constructor(
    public readonly id: string,
    public name: string,
    public phone: string,
    public description: string
  ) {}

  static create(providerSchema: ProviderSchema) {
    return new Provider(
      providerSchema.id,
      providerSchema.name,
      providerSchema.phone,
      providerSchema.description
    )
  }

  toDto() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      description: this.description
    }
  }

  static fromDto(dto: ProviderSchema) {
    return new Provider(dto.id, dto.name, dto.phone, dto.description)
  }
}
