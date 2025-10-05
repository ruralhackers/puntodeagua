'use client'

import { Filter } from 'lucide-react'
import { useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { WaterMeterFilters } from './_components/water-meter-filters'
import { WaterMeterList } from './_components/water-meter-list'

export default function WaterMeterPage() {
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [nameFilter, setNameFilter] = useState<string>('')
  const [showOnlyExcess, setShowOnlyExcess] = useState<boolean>(false)

  return (
    <PageContainer>
      <div className="flex flex-col w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Crear lectura de contador</h1>
            <p className="text-muted-foreground">
              Registra una nueva lectura de contador para un contador de agua
            </p>
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        {showFilters && (
          <Card className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200 shadow-lg shadow-blue-100/50">
            <WaterMeterFilters
              selectedZones={selectedZones}
              onZonesChange={setSelectedZones}
              nameFilter={nameFilter}
              onNameFilterChange={setNameFilter}
              showOnlyExcess={showOnlyExcess}
              onShowOnlyExcessChange={setShowOnlyExcess}
            />
          </Card>
        )}

        <WaterMeterList
          selectedZones={selectedZones}
          nameFilter={nameFilter}
          showOnlyExcess={showOnlyExcess}
        />
      </div>
    </PageContainer>
  )
}
