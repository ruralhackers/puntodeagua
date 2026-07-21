import Link from 'next/link'
import type { SearchParams } from 'nuqs/server'
import { Button } from '@/components/ui/button'
import Table from '@/features/tables/table'
import { IdCopy } from '../../components/id-copy'

export default function WaterPointTable(searchParams: SearchParams) {
  return (
    <Table
      title="Water Points"
      description="Manage water points"
      model="waterPoint"
      searchParams={searchParams}
      searchFields={['id', 'name']}
      actions={[
        <Button key="new-water-point" asChild>
          <Link href="/management/new-water-point">Nuevo punto de agua</Link>
        </Button>
      ]}
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
        { accessorKey: 'connectionNumber', header: 'Nº enganche' },
        { accessorKey: 'location', header: 'location' },
        { accessorKey: 'fixedPopulation', header: 'fixedPopulation' },
        { accessorKey: 'floatingPopulation', header: 'floatingPopulation' },
        { accessorKey: 'cadastralReference', header: 'cadastralReference' }
      ]}
    />
  )
}
