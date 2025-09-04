interface WaterMeterReadingHistoryItemProps {
  item: any
}

export default function WaterMeterReadingHistoryItem({ item }: WaterMeterReadingHistoryItemProps) {
  console.log(item)
  return (
    <div className="flex gap-4">
      <p>{item.readingDate.toLocaleString()}</p>
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
