import type { WaterMeter } from 'features'
import { Calendar, Droplets, TrendingUp } from 'lucide-react'
import WaterMeterReadingHistoryItem from './WaterMeterReadingHistoryItem'

interface WaterMeterReadingHistoryProps {
  readings: WaterMeter['readings']
  onReadingDeleted?: () => void
}

export default function WatersMeterReadingHistory({
  readings,
  onReadingDeleted
}: WaterMeterReadingHistoryProps) {
  const sortedReadings = readings
    ? [...readings].sort(
        (a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
      )
    : []

  const totalReadings = sortedReadings.length
  const totalConsumption = sortedReadings.reduce(
    (sum, reading) => sum + ((reading as { consumption?: number }).consumption || 0),
    0
  )
  const excessReadings = sortedReadings.filter(
    (reading) => (reading as { 'excess-consumption'?: boolean })['excess-consumption']
  ).length

  return (
    <div className="space-y-4">
      {/* Resumen del historial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Total de lecturas</p>
            <p className="text-lg font-semibold">{totalReadings}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Consumo total</p>
            <p className="text-lg font-semibold">{totalConsumption} L</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-600" />
          <div>
            <p className="text-sm text-gray-600">Lecturas con exceso</p>
            <p className="text-lg font-semibold">{excessReadings}</p>
          </div>
        </div>
      </div>

      {/* Lista de lecturas */}
      {sortedReadings.length > 0 ? (
        <div className="space-y-3">
          {sortedReadings.map((item) => (
            <WaterMeterReadingHistoryItem key={item.id} item={item} onDeleted={onReadingDeleted} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Droplets className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No hay lecturas registradas</p>
          <p className="text-sm">Las lecturas aparecerán aquí una vez que se registren</p>
        </div>
      )}
    </div>
  )
}
