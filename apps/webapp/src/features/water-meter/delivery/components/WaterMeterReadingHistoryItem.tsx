'use client'

import {
  Activity,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronRight,
  Droplets,
  Trash2
} from 'lucide-react'
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
import { useDeleteWaterMeterReading } from '@/src/features/water-meter-reading/hooks/use-delete-water-meter-reading'

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
  const [isExpanded, setIsExpanded] = useState(false)
  const { deleteWaterMeterReading } = useDeleteWaterMeterReading()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteWaterMeterReading(item.id)
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

  const formatDateCompact = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const formatReadingValue = (value: string) => {
    return `${Number(value).toFixed(2)} L`
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Vista compacta - clickeable para expandir */}
        <button
          type="button"
          className="w-full p-4 cursor-pointer hover:bg-gray-50 transition-colors text-left"
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsExpanded(!isExpanded)
            }
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Fecha */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{formatDateCompact(item.readingDate)}</span>
              </div>

              {/* Consumo */}
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="font-medium">
                  {item.consumption ? `${item.consumption.toFixed(0)} L` : 'No calculado'}
                </span>
              </div>
            </div>

            {/* Icono de expansión */}
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>
        </button>

        {/* Vista expandida */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="pt-4 space-y-4">
              {/* Información detallada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lectura */}
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Lectura</p>
                    <p className="font-medium">{formatReadingValue(item.reading)}</p>
                  </div>
                </div>

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
              </div>

              {/* Valor normalizado */}
              {item.normalizedReading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Valor normalizado:</span>
                  <span className="font-mono">{item.normalizedReading} L</span>
                </div>
              )}

              {/* Acciones */}
              <div className="flex justify-end">
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
        )}
      </CardContent>
    </Card>
  )
}
