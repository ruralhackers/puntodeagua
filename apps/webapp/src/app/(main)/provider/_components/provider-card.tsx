'use client'

import type { ProviderDto } from '@pda/providers/domain/entities/provider.dto'
import { Building2, Mail, Phone, Trash2, User } from 'lucide-react'
import Link from 'next/link'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/trpc/react'
import ProviderTypeBadge from './provider-type-badge'

interface ProviderCardProps {
  provider: ProviderDto
}

export default function ProviderCard({ provider }: ProviderCardProps) {
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

  const handleDelete = () => {
    deleteProviderMutation.mutate({ id: provider.id })
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Link href={`/provider/${provider.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  {provider.companyName}
                </CardTitle>
              </div>
              <div className="ml-2 flex flex-col gap-1 items-end">
                <div className="flex items-center gap-1">
                  <ProviderTypeBadge providerType={provider.providerType} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowDeleteDialog(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Badge variant={provider.isActive ? 'default' : 'secondary'} className="text-xs">
                  {provider.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{provider.contactPerson}</span>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{provider.contactPhone}</span>
            </div>

            {provider.contactEmail && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="line-clamp-1">{provider.contactEmail}</span>
              </div>
            )}

            {provider.notes && (
              <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t">
                {provider.notes}
              </p>
            )}
          </CardContent>
        </Card>
      </Link>

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
