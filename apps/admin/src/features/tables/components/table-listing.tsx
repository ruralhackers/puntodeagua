'use client'

import { useSearchParams } from 'next/navigation'
import { DataTable } from '@/components/ui/table/data-table'
import { api } from '@/trpc/react'
import type { TableListingPageProps } from '../table'

export default function TableListingPage(props: TableListingPageProps) {
  const searchParams = useSearchParams()

  const defaultItemsPerPage = 20

  const filters = props.filters
    ? props.filters.flatMap((filter) => {
        const value = searchParams.get(filter.filterKey)
        if (!value) return []

        // 🎯 MULTIPLE VALUES: Split dot-separated values into separate filters
        // "BTC.TRX" → [{ field: 'blockchain', value: 'BTC' }, { field: 'blockchain', value: 'TRX' }]
        const values = value.split('.').filter((v) => v !== '')
        return values.map((v) => ({ field: filter.filterKey, value: v }))
      })
    : []

  const selectorFilters = props.selector
    ? Object.entries(props.selector).map(([field, value]) => ({
        field,
        value: String(value)
      }))
    : []

  // Combine user filters with selector filters
  const allFilters = [...filters, ...selectorFilters]

  const orderByField = searchParams.get('sortField')
  const orderByDirection = searchParams.get('sortDirection')
  const orderBy =
    orderByField && orderByDirection
      ? { field: orderByField, direction: orderByDirection as 'asc' | 'desc' }
      : props.orderBy

  const queryParams = {
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || defaultItemsPerPage,
    search: searchParams.get('q') ?? undefined,
    searchFields: props.searchFields,
    includeFields: props.includeFields,
    filters: allFilters,
    orderBy,
    selector: props.selector
  }

  const { data } = api.table.domainTable.useQuery(
    {
      model: props.model,
      queryParams: {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search,
        searchFields: queryParams.searchFields,
        includeFields: queryParams.includeFields,
        filters: queryParams.filters.map((filter) => ({
          field: filter.field,
          value: filter.value,
          operator: 'equals' as const
        })),
        orderBy: queryParams.orderBy,
        selector: queryParams.selector
      }
    },
    {
      placeholderData: { items: [], totalItems: 0, currentPage: 1, totalPages: 0 },
      refetchInterval: 10000,
      refetchOnWindowFocus: true
    }
  )

  const TableComponent = props.customDataTable ?? DataTable

  return (
    <TableComponent
      columns={props.columns}
      data={data?.items ?? []}
      totalItems={data?.totalItems ?? 0}
      hideFooter={props.hideFooter}
    />
  )
}
