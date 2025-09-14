import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export interface Row {
  createdAt: string
}

export const createdAtColumn: ColumnDef<unknown> = {
  accessorKey: 'createdAt',
  header: 'CreatedAt',
  cell: ({ row }) => {
    const date = (row.original as { createdAt?: string }).createdAt
    return (
      <>
        <span className="text-sm">{dayjs(date).fromNow()}</span>
        <br />
        <small>{date ? new Date(date).toLocaleString() : '-'}</small>
      </>
    )
  }
}
