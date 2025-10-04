'use client'

import { AlertTriangle, ArrowRight, Gauge, Lock, TestTube, Wrench } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ExportDataPage() {
  const exportTypes = [
    {
      id: 'readings',
      title: 'Lecturas',
      description: 'Exportar lecturas de contadores de agua',
      icon: Gauge,
      enabled: false,
      comingSoon: true
    },
    {
      id: 'analysis',
      title: 'Análisis',
      description: 'Exportar análisis de calidad del agua',
      icon: TestTube,
      enabled: true,
      href: '/export/analysis'
    },
    {
      id: 'incidents',
      title: 'Incidencias',
      description: 'Exportar reportes de incidencias',
      icon: AlertTriangle,
      enabled: false,
      comingSoon: true
    },
    {
      id: 'maintenance',
      title: 'Mantenimientos',
      description: 'Exportar registros de mantenimiento',
      icon: Wrench,
      enabled: false,
      comingSoon: true
    }
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Exportar Datos</h1>
          <p className="text-muted-foreground">Selecciona el tipo de datos que deseas exportar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exportTypes.map((type) => {
            const Icon = type.icon
            const isDisabled = !type.enabled

            return (
              <Card
                key={type.id}
                className={`relative transition-all duration-200 ${
                  isDisabled
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:shadow-lg hover:scale-105 cursor-pointer'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${isDisabled ? 'bg-muted' : 'bg-primary/10'}`}
                      >
                        <Icon
                          className={`h-6 w-6 ${
                            isDisabled ? 'text-muted-foreground' : 'text-primary'
                          }`}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{type.title}</CardTitle>
                        {type.comingSoon && (
                          <Badge variant="secondary" className="mt-1">
                            Próximamente
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isDisabled ? <Lock className="h-5 w-5 text-muted-foreground" /> : null}
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-4">{type.description}</CardDescription>

                  {type.enabled ? (
                    <Button asChild className="w-full">
                      <Link href={type.href || '#'}>
                        Seleccionar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      No disponible
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Los tipos de datos marcados como "Próximamente" estarán disponibles en futuras versiones
          </p>
        </div>
      </div>
    </div>
  )
}
