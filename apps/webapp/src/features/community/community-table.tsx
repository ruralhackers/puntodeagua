'use client'
import type { SearchParams } from 'nuqs/server'
import Table from '@/features/tables/table'
import { IdCopy } from '../../components/id-copy'

export default function CommunityTable(searchParams: SearchParams) {
  return (
    <Table
      title="Communities"
      description="Manage communities"
      model="community"
      searchParams={searchParams}
      searchFields={['id', 'name']}
      columns={[
        {
          accessorKey: 'id',
          header: 'Id',
          cell: ({ row }) => {
            const id = row.getValue('id') as string
            return <IdCopy id={id} />
          }
        },
        { accessorKey: 'name', header: 'name' },
        {
          accessorKey: 'planId',
          header: 'Plan Id',
          cell: ({ row }) => {
            const planId = row.getValue('planId') as string
            return <IdCopy id={planId} />
          }
        },
        {
          accessorKey: 'waterLimitRule',
          header: 'waterLimitRule',
          cell: ({ row }) => {
            const waterLimitRule = row.getValue('waterLimitRule') as string
            return <span>{JSON.stringify(waterLimitRule)}</span>
          }
        }
      ]}
    />
  )
}
