'use client'

import { useEffect, useState } from 'react'
import WaterMeterCard from './components/WaterMeterCard'

export default function WaterMeterPage() {
  const [meters, setMeters] = useState([])

  useEffect(() => {
    const fetchMeters = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/water-meters')
        if (!res.ok) {
          throw new Error()
        }
        const data = await res.json()
        setMeters(data)
      } catch (error) {
        console.log(error)
      }
    }
    fetchMeters()
  }, [])

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
        <WaterMeterCard key={meter.id} meter={meter} />
      ))}
    </div>
  )
}
