'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSpanishNumberParser } from '@/hooks/use-spanish-number-parser'
import { api } from '@/trpc/react'

const editReadingSchema = z.object({
  reading: z.string().min(1, 'La lectura es requerida'),
  notes: z.string().nullable().optional()
})

type EditReadingFormData = z.infer<typeof editReadingSchema>

interface EditReadingModalProps {
  isOpen: boolean
  onClose: () => void
  reading: {
    id: string
    reading: string
    notes: string | null
  }
  onSuccess?: () => void
}

export function EditReadingModal({ isOpen, onClose, reading, onSuccess }: EditReadingModalProps) {
  const { parseSpanishNumber, formatToSpanish } = useSpanishNumberParser()

  const form = useForm<EditReadingFormData>({
    resolver: zodResolver(editReadingSchema),
    defaultValues: {
      reading: formatToSpanish(parseFloat(reading.reading)),
      notes: reading.notes || ''
    }
  })

  const updateReadingMutation = api.waterAccount.updateWaterMeterReading.useMutation({
    onSuccess: () => {
      toast.success('Lectura actualizada correctamente')
      onSuccess?.()
      onClose()
    },
    onError: (error) => {
      toast.error('Error al actualizar la lectura: ' + error.message)
    }
  })

  const onSubmit = async (data: EditReadingFormData) => {
    updateReadingMutation.mutate({
      id: reading.id,
      reading: parseSpanishNumber(data.reading).toString(),
      notes: data.notes || null
    })
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Lectura</DialogTitle>
          <DialogDescription>
            Modifica la lectura del contador. Se pueden editar las dos últimas lecturas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lectura</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingresa la nueva lectura"
                      {...field}
                      disabled={updateReadingMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Agrega notas sobre esta lectura..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ''}
                      disabled={updateReadingMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateReadingMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateReadingMutation.isPending}>
                {updateReadingMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Actualizar Lectura
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
