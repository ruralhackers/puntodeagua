import type { ColumnDef } from '@tanstack/react-table'
import type { SearchParams } from 'nuqs/server'
import { Suspense } from 'react'
import { Separator } from '@/components/ui/separator'
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton'
import { searchParamsCache, serialize } from '@/lib/searchparams'
import PageContainer from '../../components/layout/page-container'
import { Heading } from '../../components/ui/heading'
import TableAction, { type TableFilterProps } from './components/table-items/table-action'
import TableListingPage from './components/table-listing'

export interface TableProps extends TableListingPageProps {
  title: string
  description: string
  searchParams: SearchParams
  hideHeader?: boolean
  hideFooter?: boolean
}

export interface TableListingPageProps {
  model: string
  columns: ColumnDef<unknown>[]
  searchFields: string[]
  includeFields?: string[]
  orderBy?: { field: string; direction: 'asc' | 'desc' }
  filters?: TableFilterProps[]
  actions?: React.ReactNode[]
  selector?: object
  customDataTable?: React.ComponentType<{
    columns: ColumnDef<unknown>[]
    data: unknown[]
    totalItems: number
    hideFooter?: boolean
  }>
  hideFooter?: boolean
  hideHeader?: boolean
}

export default function Table(props: TableProps) {
  const searchParams = props.searchParams
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams)

  // This key is used for invoke suspense if any of the search params changed (used for filters).
  const key = serialize({ ...searchParams })

  const filters = props.filters ?? []

  // When both header and footer are hidden, render without PageContainer
  if (props.hideHeader && props.hideFooter) {
    return (
      <div className="space-y-4">
        <Suspense key={key} fallback={<DataTableSkeleton columnCount={5} rowCount={20} />}>
          <TableListingPage {...props} />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col space-y-4">
      {!props.hideHeader && (
        <>
          <div className="flex items-start justify-between">
            <Heading title={props.title} description={props.description} />
            {props.actions ? (
              <div className="flex items-center gap-2">{props.actions.map((a) => a)}</div>
            ) : null}
          </div>
          <Separator />
          <TableAction filters={filters} />
        </>
      )}
      <Suspense key={key} fallback={<DataTableSkeleton columnCount={5} rowCount={20} />}>
        <TableListingPage {...props} />
      </Suspense>
    </div>
  )
}
