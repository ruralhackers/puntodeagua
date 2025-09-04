'use client'

import type { WaterMeterDto } from 'features'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { GetWaterMeterQry } from '@/src/features/water-meter/application/get-water-meter.qry'
import WaterMeterReadingHistory from './components/WaterMeterReadingHistory'

interface WaterMeterDetailPageProps {
  waterMeter: WaterMeterDto
  waterMeterId: string
}

export default function WaterMeterDetailPage({
  waterMeter: initialWaterMeter,
  waterMeterId
}: WaterMeterDetailPageProps) {
  const [waterMeter, setWaterMeter] = useState<WaterMeterDto>(initialWaterMeter)
  const getWaterMeterQry = useUseCase(GetWaterMeterQry)

  const refreshWaterMeter = async () => {
    try {
      const updatedWaterMeter = await getWaterMeterQry.execute(waterMeterId)
      if (updatedWaterMeter) {
        setWaterMeter(updatedWaterMeter.toDto())
      }
    } catch (error) {
      console.error('Error refreshing water meter:', error)
    }
  }

  console.log('water meter que viene de page', waterMeter)

  return (
    <div>
      <Link href={'/dashboard/contadores'}>
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
        <WaterMeterReadingHistory
          readings={waterMeter.readings ?? []}
          onReadingDeleted={refreshWaterMeter}
        />
      </div>
    </div>
  )
}
