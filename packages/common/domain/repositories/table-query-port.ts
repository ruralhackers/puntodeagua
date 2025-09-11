export interface TableQueryParams {
  page: number
  limit: number
  search?: string
  searchFields?: string[]
  filters?: Array<{
    field: string
    value: string | number | boolean
    operator?: 'equals' | 'contains' | 'gt' | 'lt'
  }>
  orderBy?: { field: string; direction: 'asc' | 'desc' }
  include?: string[]
  selector?: Record<string, unknown>
}

export interface TableQueryResult<T> {
  items: T[]
  totalItems: number
  currentPage: number
  totalPages: number
}

export interface TableQueryPort<TEntity, TDto> {
  findForTable(params: TableQueryParams): Promise<TableQueryResult<TEntity>>
}
