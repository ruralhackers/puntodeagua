'use client'

import type { ProviderDto } from '@pda/providers/domain/entities/provider.dto'
import { Edit, MoreVertical, Power, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { api } from '@/trpc/react'

interface ProviderActionsProps {
  provider: ProviderDto
}

export default function ProviderActions({ provider }: ProviderActionsProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const utils = api.useUtils()

  const deleteProviderMutation = api.providers.deleteProvider.useMutation({
    onSuccess: () => {
      toast.success('Proveedor eliminado')
      utils.providers.getProvidersByCommunityId.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'No se pudo eliminar el proveedor')
    }
  })

  const toggleActiveMutation = api.providers.toggleProviderActive.useMutation({
    onSuccess: () => {
      toast.success(provider.isActive ? 'Proveedor desactivado' : 'Proveedor activado')
      utils.providers.getProvidersByCommunityId.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'No se pudo cambiar el estado del proveedor')
    }
  })

  const handleDelete = () => {
    deleteProviderMutation.mutate({ id: provider.id })
    setShowDeleteDialog(false)
  }

  const handleToggleActive = () => {
    toggleActiveMutation.mutate({ id: provider.id })
  }

  const handleDetail = () => {
    router.push(`/provider/${provider.id}`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDetail}>
            <Edit className="h-4 w-4 mr-2" />
            Detalle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleActive}>
            <Power className="h-4 w-4 mr-2" />
            {provider.isActive ? 'Desactivar' : 'Activar'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El proveedor "{provider.companyName}" será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
