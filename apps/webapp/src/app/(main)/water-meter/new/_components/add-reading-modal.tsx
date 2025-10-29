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
  lastReadingValue: number | null
  lastReadingDate: Date | null
  onClose: () => void
}

export function AddReadingModal({
  waterMeterId,
  waterPointName,
  measurementUnit,
  lastReadingValue,
  lastReadingDate,
  onClose
}: AddReadingModalProps) {
  const [readingForm, setReadingForm] = useState({
    reading: '',
    readingDate: new Date().toISOString().split('T')[0], // Today's date
    notes: ''
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  const utils = api.useUtils()

  // Helper function to parse Spanish number format to standard format
  // Converts "1.234,56" or "1234,56" → 1234.56
  const parseSpanishNumber = (value: string): number => {
    if (!value || value.trim() === '') return 0

    // Remove spaces
    const cleaned = value.trim()
    // Remove dots (thousands separators)
    const withoutThousands = cleaned.replace(/\./g, '')
    // Replace comma with dot (decimal separator)
    const normalized = withoutThousands.replace(',', '.')

    const parsed = parseFloat(normalized)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  // Helper function to normalize reading based on measurement unit
  const normalizeReading = (reading: string): number => {
    const value = parseSpanishNumber(reading)
    // If measurement unit is m³, convert to liters (1 m³ = 1000 L)
    const normalizedValue = measurementUnit.toLowerCase() === 'm3' ? value * 1000 : value
    return normalizedValue
  }

  // Helper function to format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Mutation for adding new reading
  const addReadingMutation = api.waterAccount.addWaterMeterReading.useMutation({
    onSuccess: async () => {
      // Invalidate and refetch water meters data
      await utils.waterAccount.getActiveWaterMetersOrderedByLastReading.invalidate()
      // Invalidate water meter readings to update the history
      await utils.waterAccount.getWaterMeterReadings.invalidate({ waterMeterId })
      // Invalidate water meter details to update last reading and excess consumption
      await utils.waterAccount.getWaterMeterById.invalidate({ id: waterMeterId })
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

    // Client-side validation: check if new reading is less than last reading
    if (lastReadingValue !== null) {
      const newNormalizedReading = normalizeReading(readingForm.reading)
      if (newNormalizedReading < lastReadingValue) {
        setValidationError('La nueva lectura no puede ser menor que la última lectura')
        return
      }
    }

    setValidationError(null)
    // Convert Spanish format to standard format before sending to backend
    const standardReading = parseSpanishNumber(readingForm.reading).toString()
    addReadingMutation.mutate({
      waterMeterId: waterMeterId,
      reading: standardReading,
      readingDate: new Date(readingForm.readingDate),
      notes: readingForm.notes || null
    })
  }

  const handleReadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Allow only: digits, comma (one only), dots, and empty string
    const validPattern = /^[0-9]*[.,]?[0-9]*$/

    if (validPattern.test(value) || value === '') {
      setReadingForm((prev) => ({ ...prev, reading: value }))
      setValidationError(null)
    }
  }

  const handleClose = () => {
    onClose()
    setValidationError(null)
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
            {lastReadingValue !== null && (
              <>
                <br />
                <span className="text-sm text-muted-foreground">
                  Última lectura:{' '}
                  <strong>
                    {measurementUnit === 'L'
                      ? `${lastReadingValue.toLocaleString('es-ES')} L`
                      : `${(lastReadingValue / 1000).toLocaleString('es-ES')} m³`}
                  </strong>
                  {lastReadingDate && ` (${formatDate(lastReadingDate)})`}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reading" className="text-right">
              Lectura
            </Label>
            <div className="col-span-3">
              <Input
                id="reading"
                type="text"
                inputMode="decimal"
                placeholder={`0,00 ${measurementUnit}`}
                className={validationError ? 'border-red-500' : ''}
                value={readingForm.reading}
                onChange={handleReadingChange}
              />
              {validationError && <p className="text-sm text-red-500 mt-1">{validationError}</p>}
            </div>
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
            disabled={!readingForm.reading || addReadingMutation.isPending || !!validationError}
          >
            {addReadingMutation.isPending ? 'Guardando...' : 'Guardar Lectura'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
