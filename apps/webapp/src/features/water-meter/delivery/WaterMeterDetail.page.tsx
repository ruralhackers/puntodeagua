'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import WaterMeterReadingHistory from './components/WaterMeterReadingHistory'

export default function WaterMeterDetailPage() {
  const params = useParams()
  const { id } = params

  const [waterMeter, setWaterMeter] = useState(null)

  useEffect(() => {
    if (!id) return
    const fetchMeter = async () => {
      const res = await fetch(`http://localhost:4000/api/water-meter/${id}`)
      const data = await res.json()
      console.log(data)
      setWaterMeter(data)
    }
    fetchMeter()
  }, [id])

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
