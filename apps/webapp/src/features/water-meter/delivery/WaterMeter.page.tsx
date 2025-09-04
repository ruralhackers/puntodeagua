'use client'

import { useWaterMeters } from '../hooks/use-water-meters'
import WaterMeterCard from './components/WaterMeterCard'

export default function WaterMeterPage() {
  const { meters, isLoading, error } = useWaterMeters()

  if (isLoading) {
    return <div>Loading water meters...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <div>
        <h1>Contadores</h1>
        <p>Gestión de contadores y control de consumos</p>
      </div>
      <div>
        {/* <Input type="search" placeholder="Buscar por nombre..." /> */}
        {/* el botón Filtrar debe abrir un modal */}
        {/* <Button>Filtrar</Button> */}
      </div>
      {meters.map((meter) => (
        <WaterMeterCard key={meter.id.toString()} meter={meter.toDto()} />
      ))}
    </div>
  )
}
