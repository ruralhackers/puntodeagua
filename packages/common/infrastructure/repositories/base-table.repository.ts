import type {
  TableQueryParams,
  TableQueryPort,
  TableQueryResult
} from '../../domain/repositories/table-query-port'
import { BasePrismaRepository } from './base-prisma.repository'

export abstract class BaseTableRepository<TEntity, TDto>
  extends BasePrismaRepository
  implements TableQueryPort<TEntity, TDto>
{
  // Abstract methods that must be implemented by concrete repositories
  protected abstract entityFromDto(dto: unknown): TEntity
  protected abstract entityToDto(entity: TEntity): TDto
  protected abstract getSearchableFields(): string[]

  async findForTable(params: TableQueryParams): Promise<TableQueryResult<TEntity>> {
    const where = this.buildWhereClause(params)
    const orderBy = this.buildOrderBy(params)

    const [items, totalItems] = await Promise.all([
      // biome-ignore lint/suspicious/noExplicitAny: Used for dynamically accessing a Prisma model by its string name.
      (this.db as any)[this.model].findMany({
        where,
        orderBy,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: this.buildInclude(params.include)
      }),
      // biome-ignore lint/suspicious/noExplicitAny: Used for dynamically accessing a Prisma model by its string name.
      (this.db as any)[this.model].count({ where })
    ])

    return {
      items: items.map((item: unknown) => this.entityFromDto(item)),
      totalItems,
      currentPage: params.page,
      totalPages: Math.ceil(totalItems / params.limit)
    }
  }

  private buildWhereClause(params: TableQueryParams) {
    let whereClause: Record<string, unknown> = {}

    // Search functionality
    if (params.search && params.searchFields) {
      whereClause = {
        ...whereClause,
        OR: params.searchFields.map((field) => {
          // Handle nested fields like 'user.name'
          if (field.includes('.')) {
            const [relation, subField] = field.split('.')
            return {
              [relation]: {
                [subField]: { contains: params.search, mode: 'insensitive' }
              }
            }
          }
          return { [field]: { contains: params.search, mode: 'insensitive' } }
        })
      }
    }

    // Filters
    if (params.filters?.length) {
      const filterConditions = params.filters.map((filter) => {
        const operator = filter.operator || 'equals'

        // Handle boolean values
        if (filter.value === 'true' || filter.value === 'false') {
          return { [filter.field]: filter.value === 'true' }
        }

        // Handle different operators
        if (operator === 'contains') {
          return { [filter.field]: { contains: filter.value, mode: 'insensitive' } }
        }

        return { [filter.field]: { [operator]: filter.value } }
      })

      whereClause = {
        ...whereClause,
        AND: filterConditions
      }
    }

    return whereClause
  }

  private buildOrderBy(params: TableQueryParams) {
    if (!params.orderBy) return { id: 'asc' }

    // Handle nested fields like 'user.name'
    if (params.orderBy.field.includes('.')) {
      const [relation, subField] = params.orderBy.field.split('.')
      return {
        [relation]: {
          [subField]: params.orderBy.direction
        }
      }
    }

    return {
      [params.orderBy.field]: params.orderBy.direction
    }
  }

  private buildInclude(includeFields?: string[]) {
    if (!includeFields?.length) return undefined

    return includeFields.reduce(
      (acc, field) => {
        acc[field] = true
        return acc
      },
      {} as Record<string, boolean>
    )
  }
}
