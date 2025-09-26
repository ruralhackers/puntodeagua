'use client'

import type { WaterPointDto } from '@pda/community/domain'
import { Users } from 'lucide-react'

interface PopulationInfoSectionProps {
  waterPoint: WaterPointDto
}

export default function PopulationInfoSection({ waterPoint }: PopulationInfoSectionProps) {
  const totalPopulation = waterPoint.fixedPopulation + waterPoint.floatingPopulation

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Información de Población</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
          <div>
            <p className="font-medium">Población Fija</p>
            <p className="text-2xl font-bold text-blue-600">{waterPoint.fixedPopulation}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
          <Users className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-medium">Población Flotante</p>
            <p className="text-2xl font-bold text-green-600">{waterPoint.floatingPopulation}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <Users className="h-6 w-6 text-gray-600" />
        <div>
          <p className="font-medium">Población Total</p>
          <p className="text-2xl font-bold text-gray-600">{totalPopulation}</p>
        </div>
      </div>
    </div>
  )
}
