export interface FindableAll<In, Filters = void> {
  findAll(filters?: Filters): Promise<In[]>
}
