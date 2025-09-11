import type {
  TableQueryBuilderContext,
  TableQueryConfig
} from '../../domain/repositories/table-query-config'
import type { TableQueryParams, TableQueryResult } from '../../domain/repositories/table-query-port'

/**
 * Abstract base class for building table queries using declarative configuration.
 * Eliminates code duplication by providing unified logic for search, filter, sort, and pagination.
 *
 * Subclasses only need to implement database-specific query execution.
 */
export abstract class TableQueryBuilder<TEntity, TDto> {
  constructor(protected readonly config: TableQueryConfig<TEntity, TDto>) {}

  /**
   * Main entry point - builds and executes query using configuration
   */
  async findForTable(params: TableQueryParams): Promise<TableQueryResult<TEntity>> {
    const context = this.buildContext(params)
    const dbQuery = this.buildDatabaseQuery(context)
    const countQuery = this.buildCountQuery(context)

    const [rawItems, totalItems] = await Promise.all([
      this.executeQuery(dbQuery, context),
      this.executeCount(countQuery)
    ])

    // Convert raw database items to domain entities
    const entities = rawItems
      .map((item) => this.config.entityFromDto?.(item))
      .filter((entity): entity is TEntity => !!entity)

    return {
      items: entities,
      totalItems,
      currentPage: params.page,
      totalPages: Math.ceil(totalItems / params.limit)
    }
  }

  /**
   * Build unified query context from table parameters
   */
  private buildContext(params: TableQueryParams): TableQueryBuilderContext {
    return {
      searchTerm: params.search,
      searchFields: params.searchFields,
      filters: params.filters,
      orderBy: params.orderBy || this.config.defaultSort,
      include: params.include,
      page: params.page,
      limit: params.limit,
      selector: params.selector
    }
  }

  /**
   * Build database-agnostic query structure
   */
  private buildDatabaseQuery(context: TableQueryBuilderContext): DatabaseQuery {
    return {
      where: this.buildWhereClause(context),
      orderBy: this.buildOrderClause(context),
      pagination: this.buildPaginationClause(context),
      include: this.buildIncludeClause(context)
    }
  }

  /**
   * Build WHERE clause with search and filters
   */
  private buildWhereClause(context: TableQueryBuilderContext): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = []

    // Add search conditions
    if (context.searchTerm && context.searchFields) {
      conditions.push(this.buildSearchConditions(context.searchTerm, context.searchFields))
    }

    // Add filter conditions
    if (context.filters?.length) {
      conditions.push(...this.buildFilterConditions(context.filters))
    }

    // Add selector conditions if provided
    if (context.selector) {
      conditions.push(context.selector)
    }

    // Combine with AND logic
    if (conditions.length === 0) return {}
    if (conditions.length === 1) return conditions[0]
    return this.combineWithAnd(conditions)
  }

  /**
   * Build search conditions using OR logic
   */
  private buildSearchConditions(
    searchTerm: string,
    searchFields: string[]
  ): Record<string, unknown> {
    const searchConditions: Record<string, unknown>[] = []

    for (const field of searchFields) {
      // Check if it's a configured field
      const fieldConfig = this.config.fields[field]
      if (fieldConfig?.customSearch) {
        searchConditions.push(fieldConfig.customSearch(searchTerm, this.config.databaseType))
        continue
      }

      // Default search logic
      searchConditions.push(this.buildDefaultSearchCondition(field, searchTerm))
    }

    return this.combineWithOr(searchConditions)
  }

  /**
   * Build filter conditions with smart grouping
   */
  private buildFilterConditions(
    filters: NonNullable<TableQueryBuilderContext['filters']>
  ): Record<string, unknown>[] {
    // Group filters by field to handle multiple values correctly
    const groupedFilters = this.groupFiltersByField(filters)

    return Object.entries(groupedFilters).map(([_field, fieldFilters]) => {
      // Multiple values for same field = OR condition (e.g., blockchain: BTC OR ETH)
      if (fieldFilters.length > 1) {
        const conditions = fieldFilters.map((filter) => this.buildSingleFilterCondition(filter))
        return this.combineWithOr(conditions)
      }
      // Single value for field = direct condition
      return this.buildSingleFilterCondition(fieldFilters[0])
    })
  }

  /**
   * Build single filter condition
   */
  private buildSingleFilterCondition(
    filter: NonNullable<TableQueryBuilderContext['filters']>[0]
  ): Record<string, unknown> {
    const { field, value, operator = 'equals' } = filter

    // Check if it's a configured field
    const fieldConfig = this.config.fields[field]
    if (fieldConfig?.customSearch && operator === 'contains') {
      return fieldConfig.customSearch(String(value), this.config.databaseType)
    }

    // Default filter logic
    return this.buildDefaultFilterCondition(field, value, operator)
  }

  /**
   * Build ORDER BY clause
   */
  private buildOrderClause(context: TableQueryBuilderContext): Record<string, unknown> {
    if (!context.orderBy) return {}

    const { field, direction } = context.orderBy

    // Check if it's a configured field
    const fieldConfig = this.config.fields[field]
    if (fieldConfig?.customSort) {
      return fieldConfig.customSort(direction, this.config.databaseType)
    }

    // Default sort logic
    return this.buildDefaultSortCondition(field, direction)
  }

  /**
   * Build pagination clause
   */
  private buildPaginationClause(context: TableQueryBuilderContext): {
    skip: number
    limit: number
  } {
    return {
      skip: (context.page - 1) * context.limit,
      limit: context.limit
    }
  }

  /**
   * Build include clause for relations
   */
  private buildIncludeClause(
    context: TableQueryBuilderContext
  ): Record<string, unknown> | undefined {
    if (!context.include?.length) return undefined

    return context.include.reduce(
      (acc, field) => {
        acc[field] = true
        return acc
      },
      {} as Record<string, unknown>
    )
  }

  /**
   * Group filters by field to handle multiple selections
   */
  private groupFiltersByField(filters: NonNullable<TableQueryBuilderContext['filters']>) {
    return filters.reduce(
      (grouped, filter) => {
        if (!grouped[filter.field]) {
          grouped[filter.field] = []
        }
        grouped[filter.field].push(filter)
        return grouped
      },
      {} as Record<string, NonNullable<TableQueryBuilderContext['filters']>>
    )
  }

  // Abstract methods for database-specific implementations
  protected abstract buildDefaultSearchCondition(
    field: string,
    searchTerm: string
  ): Record<string, unknown>
  protected abstract buildDefaultFilterCondition(
    field: string,
    value: unknown,
    operator: string
  ): Record<string, unknown>
  protected abstract buildDefaultSortCondition(
    field: string,
    direction: 'asc' | 'desc'
  ): Record<string, unknown>
  protected abstract combineWithAnd(conditions: Record<string, unknown>[]): Record<string, unknown>
  protected abstract combineWithOr(conditions: Record<string, unknown>[]): Record<string, unknown>
  protected abstract executeQuery(
    query: DatabaseQuery,
    context: TableQueryBuilderContext
  ): Promise<Record<string, unknown>[]>
  protected abstract executeCount(query: Record<string, unknown>): Promise<number>
  protected abstract buildCountQuery(context: TableQueryBuilderContext): Record<string, unknown>
}

export interface DatabaseQuery {
  where: Record<string, unknown>
  orderBy: Record<string, unknown>
  pagination: { skip: number; limit: number }
  include?: Record<string, unknown>
}
