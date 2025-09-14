import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { TableRepositoryProxy } from '@/server/repositories/TableRepositoryProxy'

export const tableRouter = createTRPCRouter({
  domainTable: protectedProcedure
    .input(
      z.object({
        model: z.string(),
        queryParams: z.object({
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
          orderBy: z.object({ field: z.string(), direction: z.enum(['asc', 'desc']) }).optional(),
          selector: z.any().optional()
        })
      })
    )
    .query(async ({ input }) => {
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
        include: queryParams.includeFields,
        selector: queryParams.selector
      }

      // ✅ UNIFIED APPROACH: Always use proxy, always convert entities to DTOs
      const proxy = new TableRepositoryProxy()
      const entitiesResult = await proxy.findForTable(model, tableParams)

      // Router converts entities to DTOs (proper clean architecture)
      return {
        items: entitiesResult.items.map((entity: unknown) => {
          const entityWithToDto = entity as { toDto: () => unknown; [key: string]: unknown }
          const dto = entityWithToDto.toDto()
          return dto
        }),
        totalItems: entitiesResult.totalItems,
        currentPage: entitiesResult.currentPage,
        totalPages: entitiesResult.totalPages
      }
    })
})
