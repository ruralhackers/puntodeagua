'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { FC } from 'react'
import { Button } from '@/components/ui/button'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { DeleteProviderCmd } from '@/src/features/providers/application/delete-provider.cmd'

export const DeleteButton: FC<{ id: string }> = ({ id }) => {
  const router = useRouter()
  const deleteUseCase = useUseCase(DeleteProviderCmd)

  const onDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proveedor?')) return
    await deleteUseCase.execute(id)
    router.push('/dashboard/proveedores')
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={onDelete} aria-label="Eliminar">
      <Trash2 className="size-4 text-red-600" aria-hidden="true" />
      <span className="sr-only">Eliminar</span>
    </Button>
  )
}
