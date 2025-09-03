"use client"

import { useEffect, useState } from "react";
import WaterMeterCard from "./components/WaterMeterCard";


export default function WaterMeterPage() {
    const [meters, setMeters] = useState([])

    useEffect(() => {
        //  llamar api aquí
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
            {meters.map(() => (
                <WaterMeterCard />
            ))}
            <WaterMeterCard />
        </div>
    )
}
