'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { WaterDepositDto } from '@pda/community'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/trpc/react'

const formSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  location: z.string(),
  notes: z.string()
})

type FormData = z.infer<typeof formSchema>

interface DepositFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided the dialog edits this deposit; otherwise it creates a new one. */
  deposit?: WaterDepositDto
}

export function DepositFormDialog({ open, onOpenChange, deposit }: DepositFormDialogProps) {
  const isEditing = Boolean(deposit)
  const utils = api.useUtils()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: deposit?.name ?? '',
      location: deposit?.location ?? '',
      notes: deposit?.notes ?? ''
    }
  })

  // Reset whenever the dialog opens so a previous edit never leaks into a new one
  useEffect(() => {
    if (open) {
      form.reset({
        name: deposit?.name ?? '',
        location: deposit?.location ?? '',
        notes: deposit?.notes ?? ''
      })
    }
  }, [open, deposit, form])

  const handleSuccess = async (message: string) => {
    await utils.community.getWaterDepositsByCommunityId.invalidate()
    toast.success(message)
    onOpenChange(false)
  }

  const createMutation = api.community.createWaterDeposit.useMutation({
    onSuccess: () => handleSuccess('Depósito creado'),
    onError: (error) => toast.error(error.message || 'No se pudo crear el depósito.')
  })

  const updateMutation = api.community.updateWaterDeposit.useMutation({
    onSuccess: () => handleSuccess('Depósito actualizado'),
    onError: (error) => toast.error(error.message || 'No se pudo actualizar el depósito.')
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: FormData) => {
    if (deposit) {
      updateMutation.mutate({ id: deposit.id, ...data })
      return
    }
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar depósito' : 'Nuevo depósito'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del depósito de agua.'
              : 'Da de alta un depósito de agua en tu comunidad.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Depósito Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección o coordenadas" {...field} />
                  </FormControl>
                  <FormDescription>Opcional. Texto libre.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas opcionales..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear depósito'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
