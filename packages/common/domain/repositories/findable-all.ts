export interface FindableAll<In> {
  findAll(): Promise<In[]>
}
