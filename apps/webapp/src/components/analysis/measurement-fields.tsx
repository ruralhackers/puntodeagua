import { TestTube } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AnalysisFormData, AnalysisFormErrors } from '@/hooks/use-analysis-form'

interface MeasurementFieldsProps {
  analysisType: string
  formData: AnalysisFormData
  errors: AnalysisFormErrors
  updateFormData: (field: string, value: string) => void
}

export default function MeasurementFields({
  analysisType,
  formData,
  errors,
  updateFormData
}: MeasurementFieldsProps) {
  if (!analysisType) return null

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TestTube className="h-4 w-4 text-purple-600" />
            <Label className="text-sm font-semibold text-purple-800">Mediciones del Análisis</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* pH Field - Conditional */}
            {['chlorine_ph', 'hardness', 'complete'].includes(analysisType) && (
              <div className="space-y-2">
                <Label htmlFor="ph" className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-lg">🧪</span>
                  pH *
                </Label>
                <Input
                  id="ph"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  placeholder="7.0"
                  value={formData.ph}
                  onChange={(e) => updateFormData('ph', e.target.value)}
                  className={errors.ph ? 'border-destructive' : 'border-purple-200'}
                />
                {errors.ph && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {errors.ph}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Rango: 0-14 (7.0 = neutro)</p>
              </div>
            )}

            {/* Chlorine Field - Conditional */}
            {['chlorine_ph', 'complete'].includes(analysisType) && (
              <div className="space-y-2">
                <Label htmlFor="chlorine" className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-lg">🧴</span>
                  Cloro (mg/L) *
                </Label>
                <Input
                  id="chlorine"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.5"
                  value={formData.chlorine}
                  onChange={(e) => updateFormData('chlorine', e.target.value)}
                  className={errors.chlorine ? 'border-destructive' : 'border-purple-200'}
                />
                {errors.chlorine && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {errors.chlorine}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Recomendado: 0.2-0.5 mg/L</p>
              </div>
            )}

            {/* Turbidity Field - Conditional */}
            {['turbidity', 'complete'].includes(analysisType) && (
              <div className="space-y-2">
                <Label htmlFor="turbidity" className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-lg">💧</span>
                  Turbidez (NTU) *
                </Label>
                <Input
                  id="turbidity"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="1.0"
                  value={formData.turbidity}
                  onChange={(e) => updateFormData('turbidity', e.target.value)}
                  className={errors.turbidity ? 'border-destructive' : 'border-purple-200'}
                />
                {errors.turbidity && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {errors.turbidity}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Recomendado: &lt; 1 NTU</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
