export interface Savable<In> {
  save(input: In): Promise<void>
}
