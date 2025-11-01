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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useIsMobile } from '@/hooks/use-mobile'
import { api } from '@/trpc/react'

const formSchema = z.object({
  newWaterMeterName: z.string().min(1, 'El nombre es requerido'),
  measurementUnit: z.enum(['L', 'M3']),
  replacementDate: z.string().optional(),
  finalReading: z.string().optional()
})

interface MeterReplacementFormProps {
  meterId: string
  onClose: () => void
  onSuccess: () => void
}

export default function MeterReplacementForm({
  meterId,
  onClose,
  onSuccess
}: MeterReplacementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: meter } = api.waterAccount.getWaterMeterById.useQuery({ id: meterId })

  const utils = api.useUtils()
  const isMobile = useIsMobile()

  // Calculate last reading value from normalized value
  const lastReadingValue =
    meter?.lastReadingNormalizedValue !== null && meter?.lastReadingNormalizedValue !== undefined
      ? meter.measurementUnit === 'M3'
        ? meter.lastReadingNormalizedValue / 1000
        : meter.lastReadingNormalizedValue
      : null

  // Dynamic schema with validation based on meter data
  const dynamicFormSchema = formSchema.refine(
    (data) => {
      // If no final reading provided, skip validation
      if (!data.finalReading || !meter?.lastReadingNormalizedValue) return true

      const finalValue = parseFloat(data.finalReading)
      if (Number.isNaN(finalValue)) return false

      // Normalize the final reading based on selected unit
      const normalizedFinal = data.measurementUnit === 'M3' ? finalValue * 1000 : finalValue

      // Compare normalized values
      return normalizedFinal >= meter.lastReadingNormalizedValue
    },
    {
      message: `La lectura final debe ser mayor o igual a la última lectura (${lastReadingValue} ${meter?.measurementUnit || ''})`,
      path: ['finalReading']
    }
  )

  const replaceMeterMutation = api.waterAccount.replaceWaterMeter.useMutation({
    onSuccess: (data) => {
      toast.success('Contador reemplazado exitosamente', {
        description: `Nuevo contador creado. Lectura final ${
          data.finalReadingCreated ? 'registrada' : 'no proporcionada'
        }.`
      })
      // Invalidate queries to refetch the list
      utils.waterAccount.getActiveWaterMetersOrderedByLastReading.invalidate()
      onSuccess()
    },
    onError: (error) => {
      toast.error('Error al reemplazar contador', {
        description: error.message
      })
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: {
      newWaterMeterName: '',
      measurementUnit: 'M3',
      replacementDate: new Date().toISOString().split('T')[0],
      finalReading: ''
    }
  })

  // Update form when meter data is loaded
  useEffect(() => {
    if (meter) {
      form.reset({
        newWaterMeterName: meter.waterPoint.name,
        measurementUnit: meter.measurementUnit as 'L' | 'M3',
        replacementDate: new Date().toISOString().split('T')[0],
        finalReading: ''
      })
    }
  }, [meter, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      await replaceMeterMutation.mutateAsync({
        oldWaterMeterId: meterId,
        newWaterMeterName: values.newWaterMeterName,
        measurementUnit: values.measurementUnit,
        replacementDate: values.replacementDate ? new Date(values.replacementDate) : undefined,
        finalReading: values.finalReading || undefined
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={isMobile ? '' : 'sm:max-w-[425px]'} fullscreenOnMobile>
        {isMobile ? (
          // Mobile fullscreen layout
          <>
            <DialogTitle className="sr-only">Reemplazar Contador</DialogTitle>
            {/* Sticky header with save and close buttons */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-2">
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reemplazar
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
                <h2 className="text-lg font-semibold">Reemplazar Contador</h2>
                <p className="text-sm text-muted-foreground">
                  {meter && (
                    <>
                      Dueño: <strong>{meter.waterAccountName}</strong>
                      <br />
                      Ubicación: {meter.waterPoint.name}
                      {lastReadingValue && (
                        <>
                          <br />
                          Última lectura:{' '}
                          <strong>
                            {lastReadingValue} {meter.measurementUnit}
                          </strong>
                          {meter.lastReadingDate && (
                            <> ({new Date(meter.lastReadingDate).toLocaleDateString('es-ES')})</>
                          )}
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="newWaterMeterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del nuevo contador</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Contador #123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="measurementUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad de medida</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona unidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="L">Litros (L)</SelectItem>
                            <SelectItem value="M3">Metros cúbicos (M3)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="replacementDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de reemplazo (opcional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="finalReading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lectura final del contador antiguo (opcional)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.001" placeholder="Ej: 1500" {...field} />
                        </FormControl>
                        <FormDescription>
                          {lastReadingValue ? (
                            <>
                              Última lectura registrada:{' '}
                              <strong>
                                {lastReadingValue} {meter?.measurementUnit}
                              </strong>
                              .
                              <br />
                              Se creará una última lectura con este valor (debe ser mayor o igual).
                            </>
                          ) : (
                            'Se creará una última lectura con este valor'
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </>
        ) : (
          // Desktop layout
          <>
            <DialogHeader>
              <DialogTitle>Reemplazar Contador</DialogTitle>
              <DialogDescription>
                {meter && (
                  <>
                    Dueño: <strong>{meter.waterAccountName}</strong>
                    <br />
                    Ubicación: {meter.waterPoint.name}
                    {lastReadingValue && (
                      <>
                        <br />
                        Última lectura:{' '}
                        <strong>
                          {lastReadingValue} {meter.measurementUnit}
                        </strong>
                        {meter.lastReadingDate && (
                          <> ({new Date(meter.lastReadingDate).toLocaleDateString('es-ES')})</>
                        )}
                      </>
                    )}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="newWaterMeterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del nuevo contador</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Contador #123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="measurementUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad de medida</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="L">Litros (L)</SelectItem>
                          <SelectItem value="M3">Metros cúbicos (M3)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="replacementDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de reemplazo (opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finalReading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lectura final del contador antiguo (opcional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" placeholder="Ej: 1500" {...field} />
                      </FormControl>
                      <FormDescription>
                        {lastReadingValue ? (
                          <>
                            Última lectura registrada:{' '}
                            <strong>
                              {lastReadingValue} {meter?.measurementUnit}
                            </strong>
                            .
                            <br />
                            Se creará una última lectura con este valor (debe ser mayor o igual).
                          </>
                        ) : (
                          'Se creará una última lectura con este valor'
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reemplazar Contador
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
