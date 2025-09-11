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
      // @ts-expect-error - Dynamic model access, works at runtime
      this.getModel().findMany({
        where,
        orderBy,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include
      }),
      // @ts-expect-error - Dynamic model access, works at runtime
      this.getModel().count({ where })
    ])

    const { entityFromDto } = this.config
    const entities = items.map((item: unknown) => entityFromDto(item as Record<string, unknown>))

    return {
      items: entities,
      totalItems,
      currentPage: params.page,
      totalPages: Math.ceil(totalItems / params.limit)
    }
  }

  private buildWhereClause(params: TableQueryParams): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = []

    if (params.search && params.searchFields) {
      conditions.push(this.buildSearchConditions(params.search, params.searchFields))
    }

    if (params.filters?.length) {
      conditions.push(...this.buildFilterConditions(params.filters))
    }
    // Add selector conditions if provided
    if (params.selector) {
      conditions.push(params.selector)
    }

    if (conditions.length === 0) return {}
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

      searchConditions.push(this.buildDefaultSearchCondition(field, searchTerm))
    }

    return { OR: searchConditions }
  }

  private buildFilterConditions(
    filters: NonNullable<TableQueryParams['filters']>
  ): Record<string, unknown>[] {
    const groupedFilters = this.groupFiltersByField(filters)

    return Object.entries(groupedFilters).map(([field, fieldFilters]) => {
      if (fieldFilters.length > 1) {
        const conditions = fieldFilters.map((filter) => this.buildSingleFilterCondition(filter))
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

  private buildDefaultSearchCondition(field: string, searchTerm: string): Record<string, unknown> {
    if (field.includes('.')) {
      const [relation, subField] = field.split('.')
      return {
        [relation]: {
          [subField]: { contains: searchTerm }
        }
      }
    }

    return { [field]: { contains: searchTerm } }
  }

  private buildDefaultFilterCondition(
    field: string,
    value: unknown,
    operator: string
  ): Record<string, unknown> {
    if (value === 'true' || value === 'false') {
      return { [field]: value === 'true' }
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
        if (!grouped[filter.field]) {
          grouped[filter.field] = []
        }
        grouped[filter.field].push(filter)
        return grouped
      },
      {} as Record<string, NonNullable<TableQueryParams['filters']>>
    )
  }

  private getModel(): unknown {
    // @ts-expect-error - Dynamic model access is safe here as we validate modelName
    return this.db[this.modelName]
  }
}
