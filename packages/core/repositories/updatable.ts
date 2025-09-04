export interface Updatable<In> {
  update(input: In): Promise<void>
}
