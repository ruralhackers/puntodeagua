'use client'

import { Activity, AlertTriangle, Calendar, Droplets, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  item: {
    id: string
    readingDate: Date
    reading: string
    normalizedReading: string
    consumption?: number
    'excess-consumption'?: boolean
  }
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const formatReadingValue = (value: string) => {
    return `${value} L`
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Información principal */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fecha */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-medium">{formatDate(item.readingDate)}</p>
              </div>
            </div>

            {/* Lectura */}
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Lectura</p>
                <p className="font-medium">{formatReadingValue(item.reading)}</p>
              </div>
            </div>

            {/* Consumo */}
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Consumo</p>
                <p className="font-medium">
                  {item.consumption ? `${item.consumption} L` : 'No calculado'}
                </p>
              </div>
            </div>
          </div>

          {/* Estado y acciones */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Estado */}
            <div className="flex items-center gap-2">
              {item['excess-consumption'] ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  <AlertTriangle className="h-3 w-3" />
                  Exceso
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <Droplets className="h-3 w-3" />
                  Normal
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>

              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="h-8">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Borrar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Confirmar eliminación?</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>
                      ¿Estás seguro de que quieres eliminar esta lectura del{' '}
                      {formatDate(item.readingDate)}? Esta acción no se puede deshacer.
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
          </div>
        </div>

        {/* Información adicional */}
        {item.normalizedReading && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Valor normalizado:</span>
              <span className="font-mono">{item.normalizedReading} L</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
