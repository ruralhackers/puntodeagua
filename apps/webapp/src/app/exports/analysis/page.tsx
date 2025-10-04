'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ANALYSIS_TYPE_OPTIONS } from '@/constants/analysis-types'

export default function AnalysisTypeSelectorPage() {
  const router = useRouter()
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleContinue = () => {
    if (selectedTypes.length === 0) return

    // Construir query string con los tipos seleccionados
    const queryString = new URLSearchParams({
      types: selectedTypes.join(',')
    }).toString()

    // Navegar al siguiente paso con los parámetros
    router.push(`/exports/analysis/dates?${queryString}`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/exports" className="hover:text-foreground">
            Exportar Datos
          </Link>
          <span>/</span>
          <span className="text-foreground">Análisis</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Tipos de Análisis</h1>
          <p className="text-muted-foreground">
            Selecciona uno o más tipos de análisis que deseas exportar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {ANALYSIS_TYPE_OPTIONS.map((option) => {
            const isSelected = selectedTypes.includes(option.value.toString())

            return (
              <Card
                key={option.value.toString()}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                }`}
                onClick={() => handleTypeToggle(option.value.toString())}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleTypeToggle(option.value.toString())}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{option.icon}</span>
                        <h3 className="font-semibold text-lg">{option.label}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">{option.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Selection Summary */}
        {selectedTypes.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Tipos Seleccionados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedTypes.map((type) => {
                  const option = ANALYSIS_TYPE_OPTIONS.find((opt) => opt.value.toString() === type)
                  return (
                    <Badge key={type} variant="secondary" className="text-sm">
                      {option?.icon} {option?.label}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/exports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>

          <Button onClick={handleContinue} disabled={selectedTypes.length === 0}>
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Validation Message */}
        {selectedTypes.length === 0 && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Selecciona al menos un tipo de análisis para continuar
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
