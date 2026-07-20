'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { useIsMobile } from '@/hooks/use-mobile'
import { api } from '@/trpc/react'

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  nationalId: z.string(),
  phone: z.string().optional(),
  notes: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

interface EditOwnerFormProps {
  accountId: string
  onClose: () => void
  onSuccess: () => void
}

export default function EditOwnerForm({ accountId, onClose, onSuccess }: EditOwnerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMobile = useIsMobile()
  const utils = api.useUtils()

  const { data: account, isLoading } = api.waterAccount.getWaterAccountById.useQuery({
    id: accountId
  })

  const updateMutation = api.waterAccount.updateWaterAccount.useMutation({
    onSuccess: () => {
      toast.success('Titular actualizado')
      utils.waterAccount.getWaterAccountsByCommunityId.invalidate()
      utils.waterAccount.getWaterAccountById.invalidate({ id: accountId })
      onSuccess()
    },
    onError: (error) => {
      toast.error('Error al actualizar titular', {
        description: error.message
      })
    }
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nationalId: '',
      phone: '',
      notes: ''
    }
  })

  useEffect(() => {
    if (!account) return
    form.reset({
      name: account.name,
      nationalId: account.nationalId,
      phone: account.phone ?? '',
      notes: account.notes ?? ''
    })
  }, [account, form])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      await updateMutation.mutateAsync({
        id: accountId,
        data: {
          name: values.name,
          nationalId: values.nationalId,
          phone: values.phone,
          notes: values.notes
        }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fields = (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre completo</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Juan Pérez" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nationalId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>DNI/NIE</FormLabel>
            <FormControl>
              <Input placeholder="Ej: 12345678A" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono de contacto (opcional)</FormLabel>
            <FormControl>
              <Input type="tel" placeholder="Ej: 666123456" {...field} />
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
              <Input placeholder="Notas adicionales" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={isMobile ? '' : 'sm:max-w-[500px]'} fullscreenOnMobile>
        {isLoading || !account ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isMobile ? (
          <>
            <DialogTitle className="sr-only">Editar Titular</DialogTitle>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-2">
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Editar Titular</h2>
                <p className="text-sm text-muted-foreground">
                  Actualiza los datos de <strong>{account.name}</strong>
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {fields}
                </form>
              </Form>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Editar Titular</DialogTitle>
              <DialogDescription>
                Actualiza los datos de <strong>{account.name}</strong>
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {fields}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar cambios
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
