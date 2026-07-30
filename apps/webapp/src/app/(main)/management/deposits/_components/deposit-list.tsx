'use client'

import type { WaterDepositDto } from '@pda/community'
import { Droplets, MapPin, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import { DepositFormDialog } from './deposit-form-dialog'

const SKELETON_ROWS = ['first', 'second', 'third']

export function DepositList() {
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [depositBeingEdited, setDepositBeingEdited] = useState<WaterDepositDto | undefined>()

  const {
    data: deposits,
    isLoading,
    error
  } = api.community.getWaterDepositsByCommunityId.useQuery(
    { id: communityId || '' },
    { enabled: !!communityId }
  )

  const openCreateDialog = () => {
    setDepositBeingEdited(undefined)
    setIsDialogOpen(true)
  }

  const openEditDialog = (deposit: WaterDepositDto) => {
    setDepositBeingEdited(deposit)
    setIsDialogOpen(true)
  }

  if (!communityId) {
    return (
      <div className="text-center text-destructive py-8">
        No se pudo determinar la comunidad del usuario
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo depósito
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {SKELETON_ROWS.map((row) => (
            <Skeleton key={row} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-destructive">Error al cargar los depósitos: {error.message}</p>
        </div>
      ) : !deposits || deposits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Droplets className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="font-semibold">Todavía no hay depósitos</h3>
            <p className="text-sm text-muted-foreground">
              Crea el primer depósito para poder asociarlo a puntos de agua, análisis e incidencias.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {deposits.map((deposit: WaterDepositDto) => (
            <Card key={deposit.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-lg">{deposit.name}</h3>
                  {deposit.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{deposit.location}</span>
                    </div>
                  )}
                  {deposit.notes && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {deposit.notes}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => openEditDialog(deposit)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DepositFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        deposit={depositBeingEdited}
      />
    </div>
  )
}
