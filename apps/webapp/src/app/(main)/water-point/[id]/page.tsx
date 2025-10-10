'use client'

import { ArrowLeft, Droplet, FileText, MapPin, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import PopulationInfoSection from '../_components/population-info-section'

export default function WaterPointDetailPage() {
  const params = useParams()
  const waterPointId = params.id as string
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id

  const [isEditingDeposits, setIsEditingDeposits] = useState(false)
  const [selectedDepositIds, setSelectedDepositIds] = useState<string[]>([])

  const utils = api.useUtils()

  const {
    data: waterPoint,
    isLoading,
    error
  } = api.community.getWaterPointById.useQuery({ id: waterPointId }, { enabled: !!waterPointId })

  const { data: availableDeposits = [] } = api.community.getWaterDepositsByCommunityId.useQuery(
    { id: communityId || '' },
    { enabled: !!communityId }
  )

  const { data: currentDeposits = [] } = api.community.getDepositsByWaterPointId.useQuery(
    { id: waterPointId },
    { enabled: !!waterPointId }
  )

  const updateDepositsMutation = api.community.updateWaterPointDeposits.useMutation({
    onSuccess: async () => {
      await utils.community.getWaterPointById.invalidate({ id: waterPointId })
      await utils.community.getDepositsByWaterPointId.invalidate({ id: waterPointId })
      toast.success('Depósitos actualizados con éxito')
      setIsEditingDeposits(false)
    },
    onError: (error) => {
      toast.error(`Error al actualizar depósitos: ${error.message}`)
    }
  })

  const handleStartEditing = () => {
    setSelectedDepositIds(waterPoint?.waterDepositIds ?? [])
    setIsEditingDeposits(true)
  }

  const handleCancelEditing = () => {
    setIsEditingDeposits(false)
    setSelectedDepositIds([])
  }

  const handleToggleDeposit = (depositId: string) => {
    setSelectedDepositIds((prev) =>
      prev.includes(depositId) ? prev.filter((id) => id !== depositId) : [...prev, depositId]
    )
  }

  const handleSaveDeposits = () => {
    updateDepositsMutation.mutate({
      waterPointId,
      depositIds: selectedDepositIds
    })
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          {/* Loading skeleton for back button and header */}
          <div className="flex items-center gap-4">
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Loading skeleton for content */}
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/water-point">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <h2 className="text-lg font-semibold mb-2">Error al cargar el punto de agua</h2>
                <p>{error.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  if (!waterPoint) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/water-point">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <h2 className="text-lg font-semibold mb-2">Punto de agua no encontrado</h2>
                <p>El punto de agua solicitado no existe o no tienes permisos para verlo.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/water-point">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{waterPoint.name}</h1>
            <p className="text-muted-foreground">Información y configuración del punto de agua</p>
          </div>
        </div>

        {/* Water Point Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-xl">{waterPoint.name}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{waterPoint.location}</span>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm">
                {waterPoint.cadastralReference}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Population Information */}
            <PopulationInfoSection waterPoint={waterPoint} />

            {/* Notes Section */}
            {waterPoint.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Notas</h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{waterPoint.notes}</p>
                  </div>
                </div>
              </>
            )}

            {/* Water Deposits Section */}
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">Depósitos de Agua</h3>
                </div>
                {!isEditingDeposits && (
                  <Button onClick={handleStartEditing} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Gestionar Depósitos
                  </Button>
                )}
              </div>

              {isEditingDeposits ? (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Selecciona los depósitos que abastecen a este punto de agua:
                  </p>
                  <div className="space-y-2">
                    {availableDeposits.map((deposit) => (
                      <div key={deposit.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`deposit-${deposit.id}`}
                          checked={selectedDepositIds.includes(deposit.id)}
                          onCheckedChange={() => handleToggleDeposit(deposit.id)}
                        />
                        <label
                          htmlFor={`deposit-${deposit.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {deposit.name} {deposit.location && `- ${deposit.location}`}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSaveDeposits}
                      size="sm"
                      disabled={updateDepositsMutation.isPending}
                    >
                      {updateDepositsMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button
                      onClick={handleCancelEditing}
                      variant="outline"
                      size="sm"
                      disabled={updateDepositsMutation.isPending}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentDeposits.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentDeposits.map((deposit) => (
                        <Badge key={deposit.id} variant="secondary" className="text-sm">
                          <Droplet className="h-3 w-3 mr-1" />
                          {deposit.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800 text-sm">
                        Este punto de agua no tiene depósitos asociados. Haz clic en{' '}
                        <strong>Gestionar Depósitos</strong> para asignar depósitos.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Information */}
            <Separator />
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Información Técnica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">ID del Punto de Agua</p>
                  <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{waterPoint.id}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Referencia Catastral</p>
                  <p className="font-mono">{waterPoint.cadastralReference}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Zona de Comunidad</p>
                  <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {waterPoint.communityZoneId}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Coordenadas</p>
                  <p className="font-mono">{waterPoint.location}</p>
                </div>
              </div>
            </div>

            {/* Information about meter readings */}
            <Separator />
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Contadores de Agua</h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  Para registrar lecturas de contadores y gestionar los medidores de agua, utiliza
                  la sección <strong>Lecturas</strong> en el menú principal.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/water-meter/new">Ir a Lecturas de Contadores</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
