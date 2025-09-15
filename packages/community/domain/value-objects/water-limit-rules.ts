export abstract class WaterLimitRule {
  abstract getRuleType(): string
  abstract getValue(): number
  abstract toDto(): WaterLimitRuleDto
}

export type WaterLimitRuleDto = {
  type: string
  value: number
}

export class WaterLimitRuleFactory {
  static types() {
    return ['PERSON_BASED', 'HOUSEHOLD_BASED']
  }
  static fromDto(dto: { type: string; value: number }): WaterLimitRule {
    switch (dto.type) {
      case 'PERSON_BASED':
        return new PersonBasedWaterLimit(dto.value)
      case 'HOUSEHOLD_BASED':
        return new HouseholdBasedWaterLimit(dto.value)
      default:
        throw new Error(`Unknown water limit rule type: ${dto.type}`)
    }
  }
}

export class PersonBasedWaterLimit extends WaterLimitRule {
  constructor(private readonly value: number) {
    super()
    if (value <= 0) {
      throw new Error('Water limit value must be greater than 0')
    }
  }

  getRuleType(): string {
    return 'PERSON_BASED'
  }

  getValue(): number {
    return this.value
  }

  toDto() {
    return {
      type: 'PERSON_BASED',
      value: this.value
    }
  }
}

export class HouseholdBasedWaterLimit extends WaterLimitRule {
  constructor(private readonly value: number) {
    super()
    if (value <= 0) {
      throw new Error('Water limit value must be greater than 0')
    }
  }

  getRuleType(): string {
    return 'HOUSEHOLD_BASED'
  }

  getValue(): number {
    return this.value
  }

  toDto() {
    return {
      type: 'HOUSEHOLD_BASED',
      value: this.value
    }
  }
}
