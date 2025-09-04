'use client'

import { useState } from 'react'
import WaterMeterReadingHistoryItem from './WaterMeterReadingHistoryItem'

export default function WaterMeterReadingHistory() {
  const [items, setItems] = useState([])

  return (
    <div>
      <div>
        <p>Historial de lecturas</p>
        <p>Contador en metros cúbicos, consumos en L</p>
      </div>
      {items.map(() => (
        <WaterMeterReadingHistoryItem />
      ))}
    </div>
  )
}
