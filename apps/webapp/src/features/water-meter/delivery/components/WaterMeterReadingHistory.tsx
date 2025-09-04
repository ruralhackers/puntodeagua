import type { WaterMeter } from 'features/entities/water-meter'
import WaterMeterReadingHistoryItem from './WaterMeterReadingHistoryItem'

interface WaterMeterReadingHistoryProps {
  readings: WaterMeter['readings']
}

export default function WaterMeterReadingHistory({ readings }: WaterMeterReadingHistoryProps) {
  return (
    <div>
      <div>
        <p>Historial de lecturas</p>
        <p>Contador en metros cúbicos, consumos en L</p>
      </div>
      {readings?.map((item) => (
        <WaterMeterReadingHistoryItem item={item} />
      ))}
    </div>
  )
}
