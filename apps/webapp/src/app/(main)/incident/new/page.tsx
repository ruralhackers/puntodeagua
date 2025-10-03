'use client'

import { AlertTriangle, Loader2, MapPin, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import CreatePageHeader from '@/components/layout/create-page-header'
import PageContainer from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { handleDomainError } from '@/lib/error-handler'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'

export default function NewIncidentPage() {
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: '',
    reporterName: user?.name || '',
    description: '',
    communityZoneId: '',
    waterDepositId: '',
    waterPointId: ''
  })

  const utils = api.useUtils()

  const { data: zones = [], isLoading: isLoadingZones } = api.community.getCommunityZones.useQuery(
    { id: communityId || '' },
    { enabled: !!communityId }
  )

  const { data: waterDeposits = [], isLoading: isLoadingDeposits } =
    api.community.getWaterDepositsByCommunityId.useQuery(
      { id: communityId || '' },
      { enabled: !!communityId }
    )

  const createIncidentMutation = api.incidents.addIncident.useMutation({
    onSuccess: async () => {
      await utils.incidents.getIncidentsByCommunityId.invalidate({ id: communityId })
      toast.success('Incidencia creada con éxito')
      router.push('/incident')
    },
    onError: (error) => {
      handleDomainError(error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.reporterName) {
      toast.error('El título y el nombre de la persona que reporta son obligatorios')
      return
    }

    createIncidentMutation.mutate({
      title: formData.title,
      reporterName: formData.reporterName,
      description: formData.description || undefined,
      communityId: communityId || '',
      communityZoneId: formData.communityZoneId || undefined,
      waterDepositId: formData.waterDepositId || undefined,
      waterPointId: formData.waterPointId || undefined,
      startAt: new Date(),
      status: 'open'
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    router.push('/incident')
  }

  if (!communityId) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          No se pudo determinar la comunidad del usuario
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <CreatePageHeader
          backHref="/incident"
          icon={AlertTriangle}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          title="Nueva Incidencia"
          description="Reporta una nueva incidencia en la infraestructura de agua de tu comunidad"
        />

        {/* Form */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                    Título *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Descripción breve de la incidencia"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="reporterName"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <User className="h-4 w-4 text-gray-600" />
                    Nombre de la persona que reporta *
                  </Label>
                  <Input
                    id="reporterName"
                    value={formData.reporterName}
                    onChange={(e) => handleInputChange('reporterName', e.target.value)}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <Card className="border-gray-200 bg-gray-50/30">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-800">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descripción detallada de la incidencia..."
                      rows={3}
                      className="border-gray-200"
                    />
                    <p className="text-xs text-muted-foreground">
                      Proporciona tantos detalles como sea posible para ayudar a resolver la
                      incidencia rápidamente
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card className="border-green-200 bg-green-50/30">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <Label className="text-sm font-semibold text-green-800">
                        Ubicación (Opcional)
                      </Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Water Zone */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="communityZone"
                          className="text-sm font-medium text-green-700"
                        >
                          Zona de Agua
                        </Label>
                        {isLoadingZones ? (
                          <div className="h-10 w-full rounded-md border border-green-200 bg-muted animate-pulse flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                          </div>
                        ) : (
                          <Select
                            value={formData.communityZoneId}
                            onValueChange={(value) => handleInputChange('communityZoneId', value)}
                          >
                            <SelectTrigger className="border-green-200">
                              <SelectValue placeholder="Selecciona una zona (opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {zones.map((zone) => (
                                <SelectItem key={zone.id} value={zone.id}>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-green-600" />
                                    {zone.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      {/* Water Deposit */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="waterDeposit"
                          className="text-sm font-medium text-green-700"
                        >
                          Depósito de Agua
                        </Label>
                        {isLoadingDeposits ? (
                          <div className="h-10 w-full rounded-md border border-green-200 bg-muted animate-pulse flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                          </div>
                        ) : (
                          <Select
                            value={formData.waterDepositId}
                            onValueChange={(value) => handleInputChange('waterDepositId', value)}
                          >
                            <SelectTrigger className="border-green-200">
                              <SelectValue placeholder="Selecciona un depósito (opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {waterDeposits.map((deposit) => (
                                <SelectItem key={deposit.id} value={deposit.id}>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-blue-600" />
                                    {deposit.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createIncidentMutation.isPending}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createIncidentMutation.isPending || !formData.title || !formData.reporterName
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {createIncidentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Crear Incidencia
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
