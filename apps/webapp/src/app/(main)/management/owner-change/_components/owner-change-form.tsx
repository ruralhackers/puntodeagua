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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useIsMobile } from '@/hooks/use-mobile'
import { api } from '@/trpc/react'

const formSchema = z
  .object({
    ownerType: z.enum(['existing', 'new']),
    existingAccountId: z.string().optional(),
    newAccountName: z.string().optional(),
    newAccountNationalId: z.string().optional(),
    newAccountNotes: z.string().optional()
  })
  .refine(
    (data) => {
      if (data.ownerType === 'existing') {
        return !!data.existingAccountId
      }
      if (data.ownerType === 'new') {
        return !!data.newAccountName && !!data.newAccountNationalId
      }
      return false
    },
    {
      message: 'Datos incompletos',
      path: ['ownerType']
    }
  )

interface OwnerChangeFormProps {
  meterId: string
  onClose: () => void
  onSuccess: () => void
}

export default function OwnerChangeForm({ meterId, onClose, onSuccess }: OwnerChangeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: meter } = api.waterAccount.getWaterMeterById.useQuery({ id: meterId })
  const { data: allAccounts } = api.waterAccount.getAllWaterAccounts.useQuery()

  const utils = api.useUtils()
  const isMobile = useIsMobile()

  const changeOwnerMutation = api.waterAccount.changeWaterMeterOwner.useMutation({
    onSuccess: () => {
      toast.success('Titular cambiado exitosamente')
      utils.waterAccount.getActiveWaterMetersOrderedByLastReading.invalidate()
      onSuccess()
    },
    onError: (error) => {
      toast.error('Error al cambiar titular', {
        description: error.message
      })
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerType: 'existing',
      existingAccountId: '',
      newAccountName: '',
      newAccountNationalId: '',
      newAccountNotes: ''
    }
  })

  const ownerType = form.watch('ownerType')

  // Reset form when owner type changes
  useEffect(() => {
    if (ownerType === 'existing') {
      form.setValue('newAccountName', '')
      form.setValue('newAccountNationalId', '')
      form.setValue('newAccountNotes', '')
    } else {
      form.setValue('existingAccountId', '')
    }
  }, [ownerType, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      await changeOwnerMutation.mutateAsync({
        waterMeterId: meterId,
        newWaterAccountId:
          values.ownerType === 'existing' ? values.existingAccountId : undefined,
        newWaterAccountData:
          values.ownerType === 'new'
            ? {
                name: values.newAccountName!,
                nationalId: values.newAccountNationalId!,
                notes: values.newAccountNotes
              }
            : undefined
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={isMobile ? '' : 'sm:max-w-[500px]'} fullscreenOnMobile>
        {isMobile ? (
          // Mobile fullscreen layout
          <>
            <DialogTitle className="sr-only">Cambiar Titular</DialogTitle>
            {/* Sticky header with save and close buttons */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-2">
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cambiar
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

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Cambiar Titular</h2>
                <p className="text-sm text-muted-foreground">
                  {meter && (
                    <>
                      Punto de agua: <strong>{meter.waterPoint.name}</strong>
                      <br />
                      Titular actual: <strong>{meter.waterAccountName}</strong>
                    </>
                  )}
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="ownerType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>¿El nuevo titular ya está en la aldea?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="existing" />
                              </FormControl>
                              <FormLabel className="font-normal">Sí, seleccionar de la lista</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="new" />
                              </FormControl>
                              <FormLabel className="font-normal">No, es una persona nueva</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {ownerType === 'existing' && (
                    <FormField
                      control={form.control}
                      name="existingAccountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seleccionar titular existente</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una persona" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allAccounts?.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name} - {account.nationalId}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {ownerType === 'new' && (
                    <>
                      <FormField
                        control={form.control}
                        name="newAccountName"
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
                        name="newAccountNationalId"
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
                        name="newAccountNotes"
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
                  )}
                </form>
              </Form>
            </div>
          </>
        ) : (
          // Desktop layout
          <>
            <DialogHeader>
              <DialogTitle>Cambiar Titular</DialogTitle>
              <DialogDescription>
                {meter && (
                  <>
                    Punto de agua: <strong>{meter.waterPoint.name}</strong>
                    <br />
                    Titular actual: <strong>{meter.waterAccountName}</strong>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="ownerType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>¿El nuevo titular ya está en la aldea?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="existing" />
                            </FormControl>
                            <FormLabel className="font-normal">Sí, seleccionar de la lista</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="new" />
                            </FormControl>
                            <FormLabel className="font-normal">No, es una persona nueva</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {ownerType === 'existing' && (
                  <FormField
                    control={form.control}
                    name="existingAccountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seleccionar titular existente</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una persona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allAccounts?.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name} - {account.nationalId}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {ownerType === 'new' && (
                  <>
                    <FormField
                      control={form.control}
                      name="newAccountName"
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
                      name="newAccountNationalId"
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
                      name="newAccountNotes"
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
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cambiar Titular
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

