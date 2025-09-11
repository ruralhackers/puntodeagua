import type { Column } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DataTableSortedColumnProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableSortedColumn<TData, TValue>({
  column,
  title
}: DataTableSortedColumnProps<TData, TValue>) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="p-0 hover:bg-inherit"
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}
