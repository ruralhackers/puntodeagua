const issueStatusTypes = ['open', 'closed']

export class IssueStatusType {
  static OPEN = new IssueStatusType('open')
  static CLOSED = new IssueStatusType('closed')

  constructor(public readonly value: string) {}

  static create(value: string) {
    if (!IssueStatusType.isValidType(value)) {
      throw new Error(`Invalid issue type: ${value}`)
    }
    return new IssueStatusType(value)
  }

  static isValidType(value: string): boolean {
    return issueStatusTypes.includes(value)
  }

  static values() {
    return [IssueStatusType.CLOSED, IssueStatusType.OPEN]
  }

  toString(): string {
    return this.value
  }
}
