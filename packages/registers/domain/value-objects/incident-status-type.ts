const incidentStatusTypes = ['open', 'closed']

export class IncidentStatusType {
  static readonly OPEN = IncidentStatusType.fromString('open')
  static readonly CLOSED = IncidentStatusType.fromString('closed')

  private constructor(public readonly value: string) {}

  static fromString(value: string) {
    if (!IncidentStatusType.isValidType(value)) {
      throw new Error(`Invalid incident type: ${value}`)
    }
    return new IncidentStatusType(value)
  }

  static isValidType(value: string): boolean {
    return incidentStatusTypes.includes(value)
  }

  static values() {
    return incidentStatusTypes
  }

  toString(): string {
    return this.value
  }

  equals(other: IncidentStatusType): boolean {
    return this.value === other.value
  }
}
