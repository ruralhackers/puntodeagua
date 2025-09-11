'use client'
import type { SearchParams } from 'nuqs/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Table from '@/features/tables/table'

export default function UsersTable(searchParams: SearchParams) {
  return (
    <Table
      title="Users"
      description="Manage users"
      model="user"
      searchParams={searchParams}
      searchFields={['id', 'email']}
      columns={[
        {
          accessorKey: 'id',
          header: 'Id',
          cell: ({ row }) => {
            const id = row.getValue('id') as string
            const image = (row.original as { image?: string }).image
            const name = (row.original as { name?: string }).name
            return (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={image} alt={name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <span>{id}</span>
              </div>
            )
          }
        },
        { accessorKey: 'username', header: 'username' },
        { accessorKey: 'email', header: 'Email' }
      ]}
    />
  )
}
