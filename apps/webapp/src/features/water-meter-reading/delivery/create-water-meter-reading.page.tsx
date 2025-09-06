'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { WaterMeterDto, WaterPointDto } from 'features'
import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import { type ControllerRenderProps, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
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
import { getErrorMessage } from '@/lib/utils'
import { PageHeader } from '@/src/components/shared-data/page-header'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { useAuth } from '@/src/features/auth/context/auth-context'
import { CreateWaterMeterReadingCmd } from '../application/create-water-meter-reading.cmd'
import {
  getConsumptionStatusClasses,
  getConsumptionStatusMessage,
  getConsumptionTextClasses,
  useWaterMeterConsumption
} from '../hooks/use-water-meter-consumption'

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
  waterPoint: WaterPointDto
}

export const CreateWaterMeterReadingPage = ({
  waterMeter,
  waterPoint
}: CreateWaterMeterReadingPageProps) => {
  const router = useRouter()
  const { user } = useAuth()
  const createWaterMeterReadingCommand = useUseCase(CreateWaterMeterReadingCmd)
  const counterLabelId = useId()

  // Estados para manejo de loading
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateWaterMeterReadingFormValues>({
    resolver: zodResolver(createWaterMeterReadingSchema),
    defaultValues: {
      reading: '',
      readingDate: new Date(),
      notes: ''
    }
  })

  // Watch the reading value to calculate consumption in real time
  const currentReading = form.watch('reading')
  const readingDate = form.watch('readingDate')

  // Get the last reading from the readings array
  const getLastReading = () => {
    if (!waterMeter.readings || waterMeter.readings.length === 0) {
      return null
    }
    // Sort by date descending and take the first one
    return waterMeter.readings.sort(
      (a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
    )[0]
  }

  const lastReading = getLastReading()

  // Calculate consumption using the custom hook
  const consumptionData = useWaterMeterConsumption({
    currentReading,
    readingDate,
    waterMeter,
    waterPoint
  })

  async function onSubmit(values: CreateWaterMeterReadingFormValues) {
    setIsLoading(true)

    try {
      await createWaterMeterReadingCommand.execute({
        waterMeterId: waterMeter.id,
        reading: values.reading,
        readingDate: values.readingDate,
        notes: values.notes,
        uploadedBy: user?.id || 'anonymous'
      })

      // Mostrar toast de éxito
      toast.success('Lectura guardada correctamente')
      router.push(`/dashboard/nuevo-registro/contador`)
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-3 py-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <PageHeader
          title="Nueva Lectura"
          subtitle={`Registra una nueva lectura para ${waterMeter.name}`}
        />
      </div>

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Nueva Lectura */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nueva Lectura</h3>
            <div className="space-y-3">
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
                  render={({
                    field
                  }: {
                    field: ControllerRenderProps<CreateWaterMeterReadingFormValues, 'reading'>
                  }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Lectura *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            required
                            placeholder="0.000"
                            className="text-xl font-bold h-12 pr-12"
                            {...field}
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            {waterMeter.measurementUnit}
                          </span>
                        </div>
                      </FormControl>
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
                  render={({
                    field
                  }: {
                    field: ControllerRenderProps<CreateWaterMeterReadingFormValues, 'readingDate'>
                  }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Fecha *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          required
                          className="h-11"
                          value={
                            field.value ? new Date(field.value).toISOString().slice(0, 10) : ''
                          }
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.onChange(
                              e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Lectura Anterior */}
          {lastReading && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lectura Anterior</h3>
              <div className="space-y-2">
                <div className="text-xl font-bold text-gray-900">
                  {lastReading.reading} {waterMeter.measurementUnit}
                </div>
                <div className="text-gray-600">
                  {new Date(lastReading.readingDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Consumo Calculado */}
          {consumptionData && (
            <div
              className={`border rounded-lg p-6 ${getConsumptionStatusClasses(consumptionData)}`}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumo Calculado</h3>
              <div className="space-y-2">
                {consumptionData.hasPreviousReading ? (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      {consumptionData.differenceInLiters.toLocaleString('es-ES', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1
                      })}{' '}
                      L
                    </div>
                    <div className="text-gray-600">
                      {consumptionData.consumptionPerDayPerPerson?.toLocaleString('es-ES', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}{' '}
                      L/día/persona • {consumptionData.daysBetween} días
                    </div>
                    {/* <div className="text-gray-600">
                      {consumptionData.consumptionPerDayTotal?.toLocaleString('es-ES', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}{' '}
                      L/día • {consumptionData.daysBetween} días •{' '}
                      {consumptionData.peopleInWaterPoint} personas
                    </div> */}
                    <div className={`font-medium ${getConsumptionTextClasses(consumptionData)}`}>
                      {getConsumptionStatusMessage(consumptionData)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      {consumptionData.currentReading?.toLocaleString('es-ES', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1
                      })}{' '}
                      {waterMeter.measurementUnit}
                    </div>
                    <div className="text-gray-600">Primera lectura registrada</div>
                    <div className={`font-medium ${getConsumptionTextClasses(consumptionData)}`}>
                      {getConsumptionStatusMessage(consumptionData)}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones (opcional)</h3>
            <FormField
              control={form.control}
              name="notes"
              render={({
                field
              }: {
                field: ControllerRenderProps<CreateWaterMeterReadingFormValues, 'notes'>
              }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Anota cualquier observación sobre el contador, acceso, o anomalías detectadas"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 w-full">
            <Button
              className="flex-1 hover:cursor-pointer"
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 hover:cursor-pointer"
              variant="default"
              type="submit"
              disabled={isLoading || (consumptionData?.isNegativeConsumption ?? false)}
            >
              {isLoading ? 'Guardando...' : 'Guardar Lectura'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
