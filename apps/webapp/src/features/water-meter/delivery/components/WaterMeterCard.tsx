import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function WaterMeterCard({ meter }: any) {
  console.log(meter)
  return (
    <Link href={`/contadores/${meter.id}`}>
      <Card>
        <CardHeader>
          <CardTitle>{meter.name}</CardTitle>
          <div className="text-red-600 text-sm">
            Consumo anómalo (aviso que solo aparece si se sobrepasa el consumo)
          </div>
        </CardHeader>
        <CardContent>
          <p>Último consumo • fecha última lectura</p>
        </CardContent>
        <CardFooter>
          <p>{meter.waterZoneName}</p>
        </CardFooter>
      </Card>
    </Link>
  )
}
