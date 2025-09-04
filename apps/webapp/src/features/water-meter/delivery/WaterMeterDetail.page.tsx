import Link from 'next/link'
// import { useParams } from 'next/navigation'

import WaterMeterReadingHistory from './components/WaterMeterReadingHistory'

export default function WaterMeterDetailPage({ waterMeter }) {
  console.log('water meter que viene de page', waterMeter)

  return (
    <div>
      <Link href={'/contadores'}>
        <div>
          <p>Volver atrás</p>
          <h1>{waterMeter?.name}</h1>
        </div>
      </Link>
      <div className="border border-gray-200">
        <p>Último resultado en litros - fecha - warning de anomalía</p>
        <p>{waterMeter?.waterZoneName}</p>
      </div>
      <div>
        <WaterMeterReadingHistory />
      </div>
    </div>
  )
}
