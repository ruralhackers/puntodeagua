'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { DeleteWaterMeterReadingCmd } from '@/src/features/water-meter-reading/application/delete-water-meter-reading.cmd'

interface WaterMeterReadingHistoryItemProps {
  item: any
  onDeleted?: () => void
}

export default function WaterMeterReadingHistoryItem({
  item,
  onDeleted
}: WaterMeterReadingHistoryItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteCommand = useUseCase(DeleteWaterMeterReadingCmd)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteCommand.execute({ id: item.id })
      setShowDeleteDialog(false)
      onDeleted?.()
    } catch (error) {
      console.error('Error deleting water meter reading:', error)
      // TODO: Show error toast/notification
    } finally {
      setIsDeleting(false)
    }
  }

  console.log(item)
  return (
    <div className="flex gap-4">
      <p>{item.readingDate.toLocaleString()}</p>
      <p>Consumo en metros cúbicos</p>
      <p>{item.normalizedReading}</p>
      <p>Señal de advertencia si sobrepasa límite</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Editar
        </Button>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Borrar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Confirmar eliminación?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                ¿Estás seguro de que quieres eliminar esta lectura? Esta acción no se puede
                deshacer.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border-t border-gray-200"></div>
    </div>
  )
}
