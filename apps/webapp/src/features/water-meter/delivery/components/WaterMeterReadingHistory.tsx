import type { WaterMeter } from 'features'
import WaterMeterReadingHistoryItem from './WaterMeterReadingHistoryItem'

interface WaterMeterReadingHistoryProps {
  readings: WaterMeter['readings']
}

export default function WatersMeterReadingHistory({ readings }: WaterMeterReadingHistoryProps) {
  return (
    <div>
      <div>
        <p>Historial de lecturas</p>
        <p>Contador en metros cúbicos, consumos en L</p>
      </div>
      {(readings ?? []).map((item) => (
        <WaterMeterReadingHistoryItem key={item.id} item={item} />
      ))}
    </div>
  )
}
