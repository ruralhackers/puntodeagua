import { z } from 'zod'
import { communityScopedProcedure, createTRPCRouter } from '@/server/api/trpc'
import { TableRepositoryProxy } from '@/server/repositories/table-proxy.repository'

export const tableRouter = createTRPCRouter({
  domainTable: communityScopedProcedure
    .input(
      z.object({
        model: z.string(),
        queryParams: z
          .object({
            limit: z.number(),
            search: z.string().optional(),
            searchFields: z.array(z.string()).optional(),
            includeFields: z.array(z.string()).optional(),
            filters: z
              .array(
                z.object({
                  field: z.string(),
                  value: z.union([z.string(), z.number(), z.boolean()]),
                  operator: z.enum(['equals', 'contains', 'gt', 'lt']).optional()
                })
              )
              .default([]),
            page: z.number(),
            orderBy: z.object({ field: z.string(), direction: z.enum(['asc', 'desc']) }).optional()
          })
          // Strict on purpose: this used to accept a `selector` that was passed
          // straight into Prisma's where clause. Rejecting unknown keys means a
          // stale or hand-crafted parameter fails loudly instead of being
          // silently ignored, which would hide that the client expected it to
          // be honoured.
          .strict()
      })
    )
    .query(async ({ input, ctx }) => {
      const { model, queryParams } = input

      const tableParams = {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search,
        searchFields: queryParams.searchFields,
        filters: queryParams.filters.map((filter) => ({
          field: filter.field,
          value:
            filter.value === 'true'
              ? true
              : filter.value === 'false'
                ? false
                : filter.value === 'null'
                  ? null
                  : filter.value,
          operator: filter.operator ?? ('equals' as const)
        })),
        orderBy: queryParams.orderBy
          ? {
              field: queryParams.orderBy.field,
              direction: queryParams.orderBy.direction
            }
          : undefined,
        include: queryParams.includeFields
      }

      // The scope comes from the session via communityScopedProcedure, never
      // from the input, so a caller cannot ask for another community's rows.
      const proxy = new TableRepositoryProxy()
      const entitiesResult = await proxy.findForTable(model, tableParams, ctx.scope)

      return {
        items: entitiesResult.items.map((entity) => toTableDto(model, entity)),
        totalItems: entitiesResult.totalItems,
        currentPage: entitiesResult.currentPage,
        totalPages: entitiesResult.totalPages
      }
    })
})

// Explicit output projection per model. toDto() exists for persistence and
// carries fields that must never reach a client: User.toDto() includes
// passwordHash.
function toTableDto(model: string, entity: unknown): Record<string, unknown> {
  const dto = (entity as { toDto: () => Record<string, unknown> }).toDto()
  if (model === 'user') {
    const { passwordHash: _passwordHash, ...safe } = dto
    return safe
  }
  return dto
}
