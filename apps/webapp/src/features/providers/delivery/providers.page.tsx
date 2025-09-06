import type { Provider } from 'features'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Link as UILink } from '@/components/ui/link'
import { Page } from '../../../core/components/page'

export const ProvidersPage: FC<{ providers: Provider[] }> = ({ providers }) => {
  return (
    <Page>
      <div className="px-3 py-4 pb-20">
        <div className="mb-6">
          <div className="mb-4">
            <UILink
              to="/dashboard/registros"
              type="invisible"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <span className="p-2 hover:bg-gray-100 rounded-lg">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </span>
              <span className="text-sm">Volver</span>
            </UILink>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
              <p className="text-gray-600">Listado de proveedores</p>
            </div>
            <Button className="flex items-center gap-2" variant="default">
              <Link href="/dashboard/proveedores/nuevo" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Añadir
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {providers.map((p) => {
            const dto = p.toDto()
            return (
              <Link key={dto.id} href={`/dashboard/proveedores/${dto.id}`} className="block">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {dto.name || 'Proveedor'}
                      </h3>
                      <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Teléfono:</span>
                          <span>{dto.phone || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Descripción:</span>
                          <span>{dto.description || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </Page>
  )
}
