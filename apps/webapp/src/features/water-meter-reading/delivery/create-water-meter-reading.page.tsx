'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { WaterMeterDto } from 'features'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
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
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { useAuth } from '@/src/features/auth/context/auth-context'
import { CreateWaterMeterReadingCmd } from '../application/create-water-meter-reading.cmd'

const createWaterMeterReadingSchema = z.object({
  reading: z
    .string()
    .min(1, 'La lectura es requerida')
    .regex(/^\d+(\.\d+)?$/, 'Debe ser un número válido'),
  readingDate: z.date().refine((date) => date <= new Date(), {
    message: 'La fecha no puede ser futura'
  }),
  notes: z.string().optional()
})

type CreateWaterMeterReadingFormValues = z.infer<typeof createWaterMeterReadingSchema>

interface CreateWaterMeterReadingPageProps {
  waterMeter: WaterMeterDto
}

export const CreateWaterMeterReadingPage = ({ waterMeter }: CreateWaterMeterReadingPageProps) => {
  const router = useRouter()
  const { user } = useAuth()
  const createWaterMeterReadingCommand = useUseCase(CreateWaterMeterReadingCmd)
  const counterLabelId = useId()

  const form = useForm<CreateWaterMeterReadingFormValues>({
    resolver: zodResolver(createWaterMeterReadingSchema),
    defaultValues: {
      reading: '',
      readingDate: new Date(),
      notes: ''
    }
  })

  async function onSubmit(values: CreateWaterMeterReadingFormValues) {
    try {
      await createWaterMeterReadingCommand.execute({
        waterMeterId: waterMeter.id,
        reading: values.reading,
        readingDate: values.readingDate,
        notes: values.notes,
        uploadedBy: user?.id || 'anonymous'
      })

      router.push('/dashboard/nuevo-registro/contador')
    } catch (error) {
      console.error('Error creating water meter reading:', error)
    }
  }

  return (
    <div className="px-3 py-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          aria-label="Volver"
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Lectura</h1>
          <p className="text-gray-600">Registra una nueva lectura para {waterMeter.name}</p>
        </div>
      </div>

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Información de la lectura */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Lectura</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Contador (readonly) */}
              <div>
                <label
                  htmlFor={counterLabelId}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Contador
                </label>
                <div
                  id={counterLabelId}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                >
                  {waterMeter.name} - {waterMeter.waterZoneName}
                </div>
              </div>

              {/* Lectura */}
              <div>
                <FormField
                  control={form.control}
                  name="reading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lectura ({waterMeter.measurementUnit})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          placeholder="Ingresa la lectura del contador"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Ingresa el valor actual mostrado en el contador
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Fecha de lectura */}
              <div>
                <FormField
                  control={form.control}
                  name="readingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Lectura</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          required
                          value={
                            field.value ? new Date(field.value).toISOString().slice(0, 10) : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>Fecha en que se realizó la lectura</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notas */}
              <div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observaciones adicionales sobre la lectura..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Cualquier observación relevante sobre esta lectura
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 w-full">
            <Button className="flex-1" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button className="flex-1" variant="destructive" type="submit">
              Guardar Lectura
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
