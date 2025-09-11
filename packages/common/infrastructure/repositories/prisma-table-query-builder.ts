import type { PrismaClient } from '@ph/database'
import type { TableQueryConfig } from '../../domain/repositories/table-query-config'
import type { TableQueryParams, TableQueryResult } from '../../domain/repositories/table-query-port'

export class PrismaTableQueryBuilder<TEntity, TDto> {
  constructor(
    private readonly config: TableQueryConfig<TEntity, TDto>,
    private readonly db: PrismaClient,
    private readonly modelName: string
  ) {}

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<TEntity>> {
    if (!this.config.entityFromDto) {
      throw new Error('entityFromDto must be defined in the repository configuration')
    }

    const where = this.buildWhereClause(params)
    const orderBy = this.buildOrderBy(params)
    const include = this.buildInclude(params.include)

    const [items, totalItems] = await Promise.all([
      this.getModel().findMany({
        where,
        orderBy,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include
      }),
      this.getModel().count({ where })
    ])

    const { entityFromDto } = this.config
    const entities = items.map((item) => entityFromDto(item as Record<string, unknown>))

    return {
      items: entities,
      totalItems,
      currentPage: params.page,
      totalPages: Math.max(1, Math.ceil(totalItems / params.limit))
    }
  }

  private buildWhereClause(params: TableQueryParams): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = []

    if (params.search && params.searchFields) {
      const search = this.buildSearchConditions(params.search, params.searchFields)
      if (Object.keys(search).length) conditions.push(search)
    }

    if (params.filters?.length) {
      conditions.push(...this.buildFilterConditions(params.filters))
    }

    if (params.selector) {
      conditions.push(params.selector)
    }

    if (!conditions.length) return {}
    if (conditions.length === 1) return conditions[0]
    return { AND: conditions }
  }

  private buildSearchConditions(
    searchTerm: string,
    searchFields: string[]
  ): Record<string, unknown> {
    const searchConditions: Record<string, unknown>[] = []

    for (const field of searchFields) {
      const fieldConfig = this.config.fields[field]
      if (fieldConfig?.customSearch) {
        searchConditions.push(fieldConfig.customSearch(searchTerm, 'prisma'))
        continue
      }

      const condition = this.buildDefaultSearchCondition(field, searchTerm)
      if (condition) searchConditions.push(condition)
    }

    if (!searchConditions.length) return {}
    return { OR: searchConditions }
  }

  private buildFilterConditions(
    filters: NonNullable<TableQueryParams['filters']>
  ): Record<string, unknown>[] {
    const grouped = this.groupFiltersByField(filters)

    return Object.entries(grouped).map(([, fieldFilters]) => {
      if (fieldFilters.length > 1) {
        const conditions = fieldFilters.map((f) => this.buildSingleFilterCondition(f))
        return { OR: conditions }
      }
      return this.buildSingleFilterCondition(fieldFilters[0])
    })
  }

  private buildSingleFilterCondition(
    filter: NonNullable<TableQueryParams['filters']>[0]
  ): Record<string, unknown> {
    const { field, value, operator = 'equals' } = filter

    const fieldConfig = this.config.fields[field]
    if (fieldConfig?.customSearch && operator === 'contains') {
      return fieldConfig.customSearch(String(value), 'prisma')
    }

    return this.buildDefaultFilterCondition(field, value, operator)
  }

  // Returns undefined to skip invalid searches on non-text fields
  private buildDefaultSearchCondition(
    field: string,
    searchTerm: string
  ): Record<string, unknown> | undefined {
    if (field.includes('.')) {
      const [relation, subField] = field.split('.')
      const leaf = subField
      if (this.isIdLike(leaf)) {
        const idCond = this.buildIdFieldSearch(leaf, searchTerm)
        if (!idCond) return undefined
        return { [relation]: idCond }
      }
      return {
        [relation]: {
          [leaf]: { contains: searchTerm }
        }
      }
    }

    if (this.isIdLike(field)) {
      const idCond = this.buildIdFieldSearch(field, searchTerm)
      if (!idCond) return undefined
      return idCond
    }

    return { [field]: { contains: searchTerm } }
  }

  private buildIdFieldSearch(field: string, term: string): Record<string, unknown> | undefined {
    if (this.isUuid(term)) {
      return { [field]: { equals: term } }
    }
    if (this.isNumeric(term)) {
      return { [field]: { equals: Number(term) } }
    }
    // Skip invalid partial search on id-like field
    return undefined
  }

  private buildDefaultFilterCondition(
    field: string,
    value: unknown,
    operator: string
  ): Record<string, unknown> {
    if (value === 'true' || value === 'false') {
      return { [field]: value === 'true' }
    }

    if (this.isIdLike(field)) {
      if (typeof value === 'string') {
        if (this.isUuid(value)) return { [field]: { equals: value } }
        if (this.isNumeric(value)) return { [field]: { equals: Number(value) } }
      }
      return { [field]: { equals: value } }
    }

    switch (operator) {
      case 'contains':
        return { [field]: { contains: value } }
      case 'equals':
        return { [field]: { equals: value } }
      case 'gt':
        return { [field]: { gt: value } }
      case 'lt':
        return { [field]: { lt: value } }
      case 'gte':
        return { [field]: { gte: value } }
      case 'lte':
        return { [field]: { lte: value } }
      default:
        return { [field]: { equals: value } }
    }
  }

  private buildOrderBy(params: TableQueryParams): Record<string, unknown> {
    const orderBy = params.orderBy || this.config.defaultSort
    if (!orderBy) return { id: 'desc' }
    const { field, direction } = orderBy

    const fieldConfig = this.config.fields[field]
    if (fieldConfig?.customSort) {
      return fieldConfig.customSort(direction, 'prisma')
    }

    if (field.includes('.')) {
      const [relation, subField] = field.split('.')
      return {
        [relation]: {
          [subField]: direction
        }
      }
    }

    return { [field]: direction }
  }

  private buildInclude(includeFields?: string[]): Record<string, unknown> | undefined {
    if (!includeFields?.length) return undefined
    return includeFields.reduce(
      (acc, field) => {
        acc[field] = true
        return acc
      },
      {} as Record<string, unknown>
    )
  }

  private groupFiltersByField(filters: NonNullable<TableQueryParams['filters']>) {
    return filters.reduce(
      (grouped, filter) => {
        if (!grouped[filter.field]) grouped[filter.field] = []
        grouped[filter.field].push(filter)
        return grouped
      },
      {} as Record<string, NonNullable<TableQueryParams['filters']>>
    )
  }

  private isIdLike(field: string) {
    const leaf = field.split('.').pop() || field
    return leaf === 'id' || leaf.endsWith('Id')
  }

  private isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  }

  private isNumeric(value: string) {
    return /^[0-9]+$/.test(value)
  }

  private getModel() {
    // @ts-expect-error dynamic model
    return this.db[this.modelName]
  }
}
