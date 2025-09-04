import React from 'react'

export default function WaterMeterReadingHistoryItem() {
    return (
        <div>
            <p>Fecha</p>
            <p>Consumo en metros cúbicos</p>
            <p>Consumo en litros</p>
            <p>Señal de advertencia si sobrepasa límite</p>
            <div>
                <p>Editar</p>
                <p>Borrar</p>
            </div>
            <div className="border-t border-gray-200"></div>
        </div>
    )
}
