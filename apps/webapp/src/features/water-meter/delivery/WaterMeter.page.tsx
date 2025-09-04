import type { WaterMeter } from 'features/entities/water-meter'
import WaterMeterCard from './components/WaterMeterCard'

type Props = {
  waterMeters: WaterMeter[]
}

export default function WaterMeterPage({ waterMeters }: Props) {
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
      {waterMeters.map((meter) => (
        <WaterMeterCard key={meter.id.toString()} meter={meter.toDto()} />
      ))}
    </div>
  )
}
