import type { WaterMeter } from 'features'
import WaterMeterReadingHistoryItem from './WaterMeterReadingHistoryItem'

interface WaterMeterReadingHistoryProps {
  readings: WaterMeter['readings']
  onReadingDeleted?: () => void
}

export default function WatersMeterReadingHistory({
  readings,
  onReadingDeleted
}: WaterMeterReadingHistoryProps) {
  return (
    <div>
      <div>
        <p>Historial de lecturas</p>
        <p>Contador en metros cúbicos, consumos en L</p>
      </div>
      {(readings ?? []).map((item) => (
        <WaterMeterReadingHistoryItem key={item.id} item={item} onDeleted={onReadingDeleted} />
      ))}
    </div>
  )
}
