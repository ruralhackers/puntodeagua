'use client'

import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box'
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter'
import { DataTableSearch } from '@/components/ui/table/data-table-search'
import { useTableFilters } from './use-table-filters'

export type TableFilterProps = {
  filterKey: string
  title: string
  options: { value: string; label: string }[]
}

export type TableActionProps = {
  filters: TableFilterProps[]
}

export default function TableAction(props: TableActionProps) {
  const {
    filters,
    setFilters,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery
  } = useTableFilters(props.filters)

  return (
    <div className="flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey="name"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />

      {props.filters.map((filter) => (
        <DataTableFilterBox
          key={filter.filterKey}
          filterKey={filter.filterKey}
          title={filter.title}
          options={filter.options}
          setFilterValueAction={setFilters}
          filterValue={filters.find((f) => f.filterKey === filter.filterKey)?.state || ''}
        />
      ))}
      <DataTableResetFilter isFilterActive={isAnyFilterActive} onReset={resetFilters} />
    </div>
  )
}
