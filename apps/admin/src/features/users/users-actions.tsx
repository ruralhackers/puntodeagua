'use client'
import type { UserDto } from '@ph/users/domain'
import { useQueryClient } from '@tanstack/react-query'
import { Edit, Ellipsis, MoreHorizontal, Trash } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { api } from '@/trpc/react'

interface CellActionProps {
  data: UserDto
}

export const UserActions: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const { mutateAsync: updateUser } = api.user.update.useMutation()
  const { mutateAsync: deleteUser } = api.user.delete.useMutation()

  const update = async () => {
    setLoading(true)
    updateUser(data)
      .then((tx) => {
        toast.success(`User updated successfully`)
      })
      .catch((error) => {
        console.log({ error })
        toast.error(`Failed to update User: ${error}`)
      })
      .finally(() => {
        setLoading(false)
        void queryClient.refetchQueries({ queryKey: [['table', 'domainTable']], exact: false })
      })
  }

  const cancel = async () => {
    setLoading(true)
    deleteUser({ id: data.id })
      .then((tx) => {
        toast.success(`User cancelled successfully`)
      })
      .catch((error) => {
        console.log({ error })
        toast.error(`Failed to cancel transaction: ${error}`)
      })
      .finally(() => {
        setLoading(false)
        void queryClient.refetchQueries({ queryKey: [['table', 'domainTable']], exact: false })
      })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {loading ? (
          <Ellipsis className="animate-ping" />
        ) : (
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => update()}>
          <Edit className="mr-2 h-4 w-4" /> Update
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => cancel()}>
          <Trash className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
