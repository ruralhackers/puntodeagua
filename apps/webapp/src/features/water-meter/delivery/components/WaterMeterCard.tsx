import React from 'react'
import Link from 'next/link'

export default function WaterMeterCard() {
    return (
        <Link href={"/contadores/id"}>
            <div>
                <p>Nombre</p>
                <p>Última lectura - fecha</p>
                <p>Zona</p>
            </div>
        </Link>
    )
}
