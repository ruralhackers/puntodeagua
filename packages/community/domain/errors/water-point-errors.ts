export class DuplicateConnectionNumberError extends Error {
  constructor(connectionNumber: string) {
    super(`Connection number "${connectionNumber}" already exists in this community`)
    this.name = 'DuplicateConnectionNumberError'
  }
}
