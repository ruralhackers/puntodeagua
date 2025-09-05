'use client'

import type { ProviderSchema } from 'features'
import { FileText, Pencil, Phone } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import { Page } from '../../../core/components/page'
import { DeleteButton } from '../components/delete-button'

export const ProviderDetailPage: FC<{ provider: ProviderSchema }> = ({ provider }) => {
  return (
    <Page>
      <div className="px-3 py-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proveedor</h1>
            <p className="text-gray-600">Detalles del proveedor</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/proveedores/${provider.id}/editar`}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground"
            >
              <Pencil className="size-4" aria-hidden="true" />
              Editar
            </Link>
            <DeleteButton id={provider.id} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Nombre</div>
                <div className="text-base text-gray-900 font-medium">{provider.name || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Phone className="size-4 text-gray-400" aria-hidden="true" />
                  Teléfono
                </div>
                <div className="text-base text-gray-900">{provider.phone || '—'}</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="size-4 text-gray-600" aria-hidden="true" />
              <h2 className="text-sm font-medium text-gray-900">Descripción</h2>
            </div>
            {provider.description && provider.description.trim().length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {provider.description}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">Sin descripción</div>
            )}
          </div>
        </div>
      </div>
    </Page>
  )
}
