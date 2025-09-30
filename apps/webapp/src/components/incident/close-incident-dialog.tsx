'use client'

import type { IncidentDto } from '@pda/registers/domain'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { handleDomainError } from '@/lib/error-handler'
import { api } from '@/trpc/react'

interface CloseIncidentDialogProps {
  incident: IncidentDto
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CloseIncidentDialog({
  incident,
  open,
  onOpenChange,
  onSuccess
}: CloseIncidentDialogProps) {
  const [closingDescription, setClosingDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateIncidentMutation = api.incidents.updateIncident.useMutation({
    onSuccess: () => {
      toast.success('Incidencia cerrada con éxito')
      setClosingDescription('')
      onOpenChange(false)
      onSuccess()
    },
    onError: (error) => {
      handleDomainError(error)
      setIsSubmitting(false)
    }
  })

  const handleSubmit = async () => {
    if (!closingDescription.trim()) {
      toast.error('La descripción de cierre es requerida')
      return
    }

    setIsSubmitting(true)
    updateIncidentMutation.mutate({
      ...incident,
      status: 'closed',
      endAt: new Date(),
      closingDescription: closingDescription.trim()
    })
  }

  const handleCancel = () => {
    setClosingDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cerrar Incidencia</DialogTitle>
          <DialogDescription>
            Antes de cerrar la incidencia, por favor proporciona una descripción del cierre.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Descripción original (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="original-description">Descripción Original</Label>
            <Textarea
              id="original-description"
              value={incident.description || 'Sin descripción'}
              readOnly
              className="bg-muted/50"
              rows={3}
            />
          </div>

          {/* Descripción de cierre */}
          <div className="space-y-2">
            <Label htmlFor="closing-description">
              Descripción de Cierre <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="closing-description"
              value={closingDescription}
              onChange={(e) => setClosingDescription(e.target.value)}
              placeholder="Describe cómo se resolvió la incidencia..."
              rows={4}
              maxLength={2000}
            />
            <div className="text-sm text-muted-foreground">
              {closingDescription.length}/2000 caracteres
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !closingDescription.trim()}
          >
            {isSubmitting ? 'Cerrando...' : 'Cerrar Incidencia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
