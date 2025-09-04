import { WaterPoint } from 'features/entities/water-point'
import { type FC } from 'react'
import { Page } from '../../../core/components/page'

export const WaterPointPage: FC<{ waterPoints: WaterPoint[] }> = ({ waterPoints }) => {
  return (
    <Page>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Puntos de Agua</h1>
        {waterPoints.map((waterPoint) => {
          const dto = waterPoint.toDto()
          const totalPopulation = dto.fixedPopulation + dto.floatingPopulation
          return (
            <div key={dto.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold">{dto.name}</h2>
              {dto.description && <p className="text-gray-600 mb-2">{dto.description}</p>}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Ubicación:</span> {dto.location}
                </div>
                <div>
                  <span className="font-medium">Población Total:</span> {totalPopulation} personas
                </div>
                <div>
                  <span className="font-medium">Población Fija:</span> {dto.fixedPopulation}{' '}
                  personas
                </div>
                <div>
                  <span className="font-medium">Población Flotante:</span> {dto.floatingPopulation}{' '}
                  personas
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Page>
  )
}
