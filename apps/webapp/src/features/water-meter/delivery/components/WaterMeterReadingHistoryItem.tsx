import type { WaterMeterReading } from 'features/entities/water-meter-reading'

export default function WaterMeterReadingHistoryItem({ item }) {
  console.log(item)
  return (
    <div className="flex gap-4">
      <p>{item.readingDate}</p>
      <p>Consumo en metros cúbicos</p>
      <p>{item.normalizedReading}</p>
      <p>Señal de advertencia si sobrepasa límite</p>
      <div>
        <p>Editar</p>
        <p>Borrar</p>
      </div>
      <div className="border-t border-gray-200"></div>
    </div>
  )
}
