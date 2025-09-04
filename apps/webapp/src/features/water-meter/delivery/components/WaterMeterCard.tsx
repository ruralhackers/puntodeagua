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
        {/* Show anomalous consumption warning if needed */}
        {/* <div className="text-red-600 text-sm">
          Consumo anómalo (aviso que solo aparece si se sobrepasa el consumo)
        </div> */}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {meter.lastReadingValue
              ? `Última lectura: ${meter.lastReadingValue} ${meter.measurementUnit}`
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
            <Link href={`/contadores/${meter.id}`}>Ver Detalles</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
