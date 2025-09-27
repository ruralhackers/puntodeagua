'use client'

import { Calendar, Droplets, Loader2, MapPin, TestTube, User } from 'lucide-react'
import { toast } from 'sonner'
import MeasurementFields from '@/components/analysis/measurement-fields'
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
import { ANALYSIS_TYPE_OPTIONS, type AnalysisType } from '@/constants/analysis-types'
import { useAnalysisForm } from '@/hooks/useAnalysisForm'
import { api } from '@/trpc/react'

interface AddAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  communityId: string
}

export default function AddAnalysisModal({ isOpen, onClose, communityId }: AddAnalysisModalProps) {
  const { formData, errors, updateFormData, validateForm, resetForm } = useAnalysisForm()

  const utils = api.useUtils()

  // Fetch data
  const { data: waterZones = [], isLoading: isLoadingZones } =
    api.community.getCommunityZones.useQuery(
      { id: communityId },
      { enabled: !!communityId && isOpen }
    )

  const { data: waterDeposits = [], isLoading: isLoadingDeposits } =
    api.community.getWaterDepositsByCommunityId.useQuery(
      { id: communityId },
      { enabled: !!communityId && isOpen }
    )

  // Mutation
  const addAnalysisMutation = api.registers.addAnalysis.useMutation({
    onSuccess: async () => {
      await utils.registers.getAnalysesByCommunityId.invalidate({ id: communityId })
      handleClose()
      toast.success('Análisis añadido con éxito')
    },
    onError: (error) => {
      toast.error(`Error al añadir análisis: ${error.message}`)
    }
  })

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    // We know analyzedAt is not empty because validateForm() checks for it
    const analyzedAt = formData.analyzedAt
    if (!analyzedAt) return

    addAnalysisMutation.mutate({
      communityId,
      analysisType: formData.analysisType as AnalysisType,
      analyst: formData.analyst.trim(),
      analyzedAt: new Date(analyzedAt),
      waterZoneId: formData.waterZoneId || undefined,
      waterDepositId: formData.waterDepositId || undefined,
      ph: formData.ph ? Number(formData.ph) : undefined,
      turbidity: formData.turbidity ? Number(formData.turbidity) : undefined,
      chlorine: formData.chlorine ? Number(formData.chlorine) : undefined,
      description: formData.description.trim() || undefined
    })
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <TestTube className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Nuevo Análisis de Agua</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Registra un nuevo análisis de calidad del agua para tu comunidad
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Analysis Type */}
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TestTube className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-semibold text-blue-800">Tipo de Análisis *</Label>
                </div>
                <Select
                  value={formData.analysisType}
                  onValueChange={(value) => updateFormData('analysisType', value)}
                >
                  <SelectTrigger
                    className={errors.analysisType ? 'border-destructive' : 'border-blue-200'}
                  >
                    <SelectValue placeholder="Selecciona el tipo de análisis" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANALYSIS_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{option.icon}</span>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.analysisType && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {errors.analysisType}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Analyst */}
            <div className="space-y-2">
              <Label htmlFor="analyst" className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-gray-600" />
                Analista *
              </Label>
              <Input
                id="analyst"
                placeholder="Nombre del analista"
                value={formData.analyst}
                onChange={(e) => updateFormData('analyst', e.target.value)}
                className={errors.analyst ? 'border-destructive' : ''}
              />
              {errors.analyst && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.analyst}
                </p>
              )}
            </div>

            {/* Analysis Date */}
            <div className="space-y-2">
              <Label htmlFor="analyzedAt" className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-gray-600" />
                Fecha de Análisis *
              </Label>
              <Input
                id="analyzedAt"
                type="date"
                value={formData.analyzedAt}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => updateFormData('analyzedAt', e.target.value)}
                className={errors.analyzedAt ? 'border-destructive' : ''}
              />
              {errors.analyzedAt && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <span className="text-red-500">⚠</span>
                  {errors.analyzedAt}
                </p>
              )}
            </div>
          </div>

          {/* Location Information */}
          <Card className="border-green-200 bg-green-50/30">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <Label className="text-sm font-semibold text-green-800">
                    Ubicación del Análisis
                  </Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Water Zone */}
                  <div className="space-y-2">
                    <Label htmlFor="waterZoneId" className="text-sm font-medium text-green-700">
                      Zona de Agua
                    </Label>
                    {isLoadingZones ? (
                      <div className="h-10 w-full rounded-md border border-green-200 bg-muted animate-pulse flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                      </div>
                    ) : (
                      <Select
                        value={formData.waterZoneId}
                        onValueChange={(value) => updateFormData('waterZoneId', value)}
                      >
                        <SelectTrigger className="border-green-200">
                          <SelectValue placeholder="Selecciona una zona (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {waterZones.map((zone) => (
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
                    <Label htmlFor="waterDepositId" className="text-sm font-medium text-green-700">
                      Depósito de Agua
                    </Label>
                    {isLoadingDeposits ? (
                      <div className="h-10 w-full rounded-md border border-green-200 bg-muted animate-pulse flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                      </div>
                    ) : (
                      <Select
                        value={formData.waterDepositId}
                        onValueChange={(value) => updateFormData('waterDepositId', value)}
                      >
                        <SelectTrigger className="border-green-200">
                          <SelectValue placeholder="Selecciona un depósito (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {waterDeposits.map((deposit) => (
                            <SelectItem key={deposit.id} value={deposit.id}>
                              <div className="flex items-center gap-2">
                                <Droplets className="h-3 w-3 text-blue-600" />
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

          {/* Measurement Fields - Conditional */}
          <MeasurementFields
            analysisType={formData.analysisType}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          {/* Description */}
          <Card className="border-gray-200 bg-gray-50/30">
            <CardContent className="p-4">
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-800">
                  Observaciones Adicionales
                </Label>
                <Textarea
                  id="description"
                  placeholder="Añade cualquier observación relevante sobre el análisis, condiciones del agua, o notas del analista..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  className="border-gray-200"
                />
                <p className="text-xs text-muted-foreground">
                  Este campo es opcional pero puede ser útil para futuras referencias
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={addAnalysisMutation.isPending}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={addAnalysisMutation.isPending || !formData.analysisType}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {addAnalysisMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Guardar Análisis
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
