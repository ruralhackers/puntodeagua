'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { handleDomainError } from '@/lib/error-handler'
import { api } from '@/trpc/react'

interface AddReadingModalProps {
  waterMeterId: string
  waterPointName: string
  measurementUnit: string
  onClose: () => void
}

export function AddReadingModal({
  waterMeterId,
  waterPointName,
  measurementUnit,
  onClose
}: AddReadingModalProps) {
  const [readingForm, setReadingForm] = useState({
    reading: '',
    readingDate: new Date().toISOString().split('T')[0], // Today's date
    notes: ''
  })

  const utils = api.useUtils()

  // Mutation for adding new reading
  const addReadingMutation = api.waterAccount.addWaterMeterReading.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch water meters data
      await utils.waterAccount.getActiveWaterMetersOrderedByLastReading.invalidate()
      onClose()
      setReadingForm({
        reading: '',
        readingDate: new Date().toISOString().split('T')[0],
        notes: ''
      })
      toast.success('Lectura añadida con éxito')
    },
    onError: (error) => {
      handleDomainError(error)
    }
  })

  const handleSubmitReading = () => {
    if (!readingForm.reading || !readingForm.readingDate) return

    addReadingMutation.mutate({
      waterMeterId: waterMeterId,
      reading: readingForm.reading,
      readingDate: new Date(readingForm.readingDate),
      notes: readingForm.notes || null
    })
  }

  const handleClose = () => {
    onClose()
    // Reset form when closing
    setReadingForm({
      reading: '',
      readingDate: new Date().toISOString().split('T')[0],
      notes: ''
    })
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Lectura</DialogTitle>
          <DialogDescription>
            Añadir una nueva lectura para: <strong>{waterPointName}</strong>
            <br />
            <span className="text-sm text-muted-foreground">
              Unidad de medida:{' '}
              <strong>{measurementUnit === 'L' ? 'Litros (L)' : 'Metros cúbicos (m³)'}</strong>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reading" className="text-right">
              Lectura
            </Label>
            <Input
              id="reading"
              type="number"
              step="0.01"
              placeholder={`0.00 ${measurementUnit}`}
              className="col-span-3"
              value={readingForm.reading}
              onChange={(e) => setReadingForm((prev) => ({ ...prev, reading: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="readingDate" className="text-right">
              Fecha
            </Label>
            <Input
              id="readingDate"
              type="date"
              className="col-span-3"
              value={readingForm.readingDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setReadingForm((prev) => ({ ...prev, readingDate: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notas
            </Label>
            <Textarea
              id="notes"
              placeholder="Notas opcionales..."
              className="col-span-3"
              rows={3}
              value={readingForm.notes}
              onChange={(e) => setReadingForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={addReadingMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmitReading}
            disabled={!readingForm.reading || addReadingMutation.isPending}
          >
            {addReadingMutation.isPending ? 'Guardando...' : 'Guardar Lectura'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
