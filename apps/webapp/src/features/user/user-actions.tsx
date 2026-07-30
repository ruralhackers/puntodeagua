'use client'
import type { UserDto } from '@pda/user/domain'
import { Edit, MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface CellActionProps {
  data: UserDto
}

export const UserActions: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter()
  // The delete action was removed: user.delete never deleted anything, it only
  // logged. Deleting a user needs a decision on what happens to the readings
  // and incidents they created.

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${data.id}`)}>
          <Edit className="mr-2 h-4 w-4" /> Update
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
