'use client'

import { type Options, useQueryState } from 'nuqs'
import { useCallback, useMemo } from 'react'
import { searchParams } from '@/lib/searchparams'
import type { TableFilterProps } from './table-action'

export function useTableFilters(inputFilters: TableFilterProps[]) {
  const [searchQuery, setSearchQuery] = useQueryState(
    'q',
    searchParams.q.withOptions({ shallow: false, throttleMs: 1000 }).withDefault('')
  )

  const filters = inputFilters.map((filter) => {
    // biome-ignore lint/correctness/useHookAtTopLevel: Dynamic filters require this pattern
    const [state, setState] = useQueryState(
      filter.filterKey,
      searchParams.filters.withOptions({ shallow: false }).withDefault('')
    )
    return {
      filterKey: filter.filterKey,
      state,
      setState
    }
  })

  const setFilters = (
    key: string,
    value: string | ((old: string) => string | null) | null,
    options?: Options
  ) => {
    const filter = filters.find((f) => f.filterKey === key)
    if (!filter) {
      throw new Error(`Filter with key ${key} not found`)
    }
    return filter.setState(value, options)
  }

  const [page, setPage] = useQueryState('page', searchParams.page.withDefault(1))

  const resetFilters = useCallback(() => {
    setSearchQuery(null)
    filters.forEach((filter) => {
      filter.setState('')
    })
    setPage(1)
  }, [setSearchQuery, setPage, filters])

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || filters.some((filter) => !!filter.state)
  }, [searchQuery, filters])

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive,
    filters,
    setFilters
  }
}
