import type { Maintenance } from 'features'
import type { FC } from 'react'
import { Page } from '../../../core/components/page'

export const MaintenancesPage: FC<{ maintenances: Maintenance[] }> = ({ maintenances }) => {
  return (
    <Page>
      <div className="px-3 py-4">
        <h1 className="text-2xl font-bold">Mantenimientos</h1>
        <ul className="mt-4 space-y-2">
          {maintenances.map((m) => {
            const dto = m.toDto()
            return (
              <li key={dto.id} className="text-sm text-gray-700">
                {dto.id}
              </li>
            )
          })}
        </ul>
      </div>
    </Page>
  )
}
