import type { Provider } from 'features'
import { ArrowLeft, Edit3, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Page } from '../../../core/components/page'

export const ProvidersPage: FC<{ providers: Provider[] }> = ({ providers }) => {
  return (
    <Page>
      <div className="px-3 py-4 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <Button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" variant="ghost">
            <Link href="/dashboard/registros">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
            <p className="text-gray-600">Listado de proveedores del sistema</p>
          </div>
          <div className="ml-auto">
            <Button className="flex items-center gap-2" variant="destructive">
              <Link href="/dashboard/proveedores/nuevo" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Añadir proveedor
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {providers.map((p) => {
            const dto = p.toDto()
            return (
              <div
                key={dto.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
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

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`#`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                      type="button"
                      disabled
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Page>
  )
}
