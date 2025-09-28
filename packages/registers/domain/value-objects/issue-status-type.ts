const issueStatusTypes = ['open', 'closed']

export class IssueStatusType {
  static readonly OPEN = IssueStatusType.fromString('open')
  static readonly CLOSED = IssueStatusType.fromString('closed')

  private constructor(public readonly value: string) {}

  static fromString(value: string) {
    if (!IssueStatusType.isValidType(value)) {
      throw new Error(`Invalid issue type: ${value}`)
    }
    return new IssueStatusType(value)
  }

  static isValidType(value: string): boolean {
    return issueStatusTypes.includes(value)
  }

  static values() {
    return issueStatusTypes
  }

  toString(): string {
    return this.value
  }

  equals(other: IssueStatusType): boolean {
    return this.value === other.value
  }
}
