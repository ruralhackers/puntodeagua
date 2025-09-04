import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import WaterMeterReadingHistory from './components/WaterMeterReadingHistory'

export default function WaterMeterDetailPage() {
  return (
    <div>
      <Link href={'/contadores'}>
        <div>
          <p>Volver atrás</p>
          <h1>Nombre</h1>
        </div>
      </Link>
      <div className="border border-gray-200">
        <p>Último resultado en litros - fecha - warning de anomalía</p>
        <p>Zona</p>
      </div>
      <div>
        <WaterMeterReadingHistory />
      </div>
    </div>
  )
}
