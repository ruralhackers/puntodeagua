'use client'

import { AlertTriangle, Loader2, MapPin, User } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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
import { api } from '@/trpc/react'

interface AddIncidentModalProps {
  isOpen: boolean
  onClose: () => void
  communityId: string
}

export default function AddIncidentModal({ isOpen, onClose, communityId }: AddIncidentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    reporterName: '',
    description: '',
    waterZoneId: '',
    waterDepositId: '',
    waterPointId: ''
  })

  const utils = api.useUtils()

  const { data: zones = [], isLoading: isLoadingZones } = api.community.getCommunityZones.useQuery(
    { id: communityId },
    { enabled: !!communityId && isOpen }
  )

  const { data: waterDeposits = [], isLoading: isLoadingDeposits } =
    api.community.getWaterDepositsByCommunityId.useQuery(
      { id: communityId },
      { enabled: !!communityId && isOpen }
    )

  const createIncidentMutation = api.incidents.addIncident.useMutation({
    onSuccess: async () => {
      await utils.incidents.getIncidentsByCommunityId.invalidate({ id: communityId })
      handleClose()
      toast.success('Incidencia creada con éxito')
    },
    onError: (error) => {
      toast.error('Error al crear la incidencia: ' + error.message)
    }
  })

  const handleClose = () => {
    setFormData({
      title: '',
      reporterName: '',
      description: '',
      waterZoneId: '',
      waterDepositId: '',
      waterPointId: ''
    })
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.reporterName) {
      toast.error('El título y el nombre del reportero son obligatorios')
      return
    }

    createIncidentMutation.mutate({
      title: formData.title,
      reporterName: formData.reporterName,
      description: formData.description || undefined,
      communityId,
      waterZoneId: formData.waterZoneId || undefined,
      waterDepositId: formData.waterDepositId || undefined,
      waterPointId: formData.waterPointId || undefined,
      startAt: new Date(),
      status: 'open'
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Don't render if no communityId
  if (!communityId) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Reportar Nueva Incidencia</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Reporta una nueva incidencia en la infraestructura de agua de tu comunidad
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
              <Label htmlFor="reporterName" className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-gray-600" />
                Nombre del Reportero *
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
                  Proporciona tantos detalles como sea posible para ayudar a resolver la incidencia
                  rápidamente
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
                    <Label htmlFor="waterZone" className="text-sm font-medium text-green-700">
                      Zona de Agua
                    </Label>
                    {isLoadingZones ? (
                      <div className="h-10 w-full rounded-md border border-green-200 bg-muted animate-pulse flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                      </div>
                    ) : (
                      <Select
                        value={formData.waterZoneId}
                        onValueChange={(value) => handleInputChange('waterZoneId', value)}
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
                    <Label htmlFor="waterDeposit" className="text-sm font-medium text-green-700">
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
        </div>

        <DialogFooter className="gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createIncidentMutation.isPending}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={createIncidentMutation.isPending || !formData.title || !formData.reporterName}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
