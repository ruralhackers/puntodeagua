'use client'
import type { UserDto } from '@ph/users/domain'
import type { SearchParams } from 'nuqs/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Table from '@/features/tables/table'
import { IdCopy } from '../../components/id-copy'
import { RelativeDate } from '../../components/relative-date'
import { UserActions } from './users-actions'

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
                <span>
                  <IdCopy id={id} />
                </span>
              </div>
            )
          }
        },
        { accessorKey: 'username', header: 'username' },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'credits', header: 'credits' },
        {
          accessorKey: 'createdAt',
          header: 'createdAt',
          cell: ({ row }) => {
            const { local, relative } = RelativeDate(row.getValue('createdAt'))
            return <span title={local}>{relative}</span>
          }
        },
        {
          id: 'actions',
          cell: ({ row }) => {
            const user = row.original as UserDto
            return <UserActions data={user} />
          }
        }
      ]}
    />
  )
}
