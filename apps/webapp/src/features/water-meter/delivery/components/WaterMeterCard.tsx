import type { WaterMeterDto } from 'features'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface WaterMeterCardProps {
  meter: WaterMeterDto
}

export default function WaterMeterCard({ meter }: WaterMeterCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>{meter.name}</span>
          <Button asChild size="sm" className="text-xs">
            <Link href={`/dashboard/nuevo-registro/contador/${meter.id}`}>Nueva Lectura</Link>
          </Button>
        </CardTitle>
        {meter.readings && meter.readings.length > 0 && meter.readings[0]['excess-consumption'] && (
          <div className="text-red-600 text-sm font-medium">⚠️ Consumo anómalo detectado</div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {meter.readings && meter.readings.length > 0
              ? `Último consumo: ${meter.readings[0].consumption} l.`
              : 'Sin lecturas registradas'}
          </p>
          {meter.lastReadingDate && (
            <p className="text-xs text-gray-500">
              {new Date(meter.lastReadingDate).toLocaleDateString('es-ES')}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between items-center w-full">
          <p className="text-sm text-gray-600">{meter.waterZoneName}</p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/registros/contadores/${meter.id}`}>Ver Detalles</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
