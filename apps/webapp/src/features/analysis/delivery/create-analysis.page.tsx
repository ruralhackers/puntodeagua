'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { WaterZoneDto } from 'features'
import { analysisSchema } from 'features/registers/schemas/analysis.schema'
import { AnalysisType } from 'features/registers/value-objects/analysis-type'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useId, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
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
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { CreateAnalysisCmd } from '@/src/features/analysis/application/create-analysis.cmd'

export const CreateAnalysisPage: NextPage<{ waterZones: WaterZoneDto[] }> = ({ waterZones }) => {
  const router = useRouter()
  const createAnalysisCommand = useUseCase(CreateAnalysisCmd)
  const createAnalysisSchema = analysisSchema.omit({ id: true })

  const form = useForm<z.infer<typeof createAnalysisSchema>>({
    resolver: zodResolver(createAnalysisSchema),
    defaultValues: {
      description: '',
      waterZoneId: '',
      analysisType: '',
      analyst: '',
      analyzedAt: new Date(),
      ph: '',
      turbidity: '',
      chlorine: ''
    }
  })

  const selectedType = form.watch('analysisType')
  const analysisTypeId = useId()
  const analysisParams = useMemo(() => {
    if (!selectedType || !AnalysisType.isValidType(selectedType)) return []
    return AnalysisType.create(selectedType).getFieldsByType()
  }, [selectedType])

  async function onSubmit(values: z.infer<typeof createAnalysisSchema>) {
    await createAnalysisCommand.execute(values)
    router.push('/')
  }

  function onChangeAnalysisType(value: string) {
    form.setValue('analysisType', value, { shouldValidate: true })
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
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Análisis</h1>
          <p className="text-gray-600">Reporta una nueva análisis o problema</p>
        </div>
      </div>

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Información básica */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <FormField
                  control={form.control}
                  name="waterZoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zona de Agua</FormLabel>
                      <FormControl>
                        <select
                          required
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Selecciona una zona</option>
                          {(waterZones ?? []).map((z) => (
                            <option key={z.id} value={z.id.toString()}>
                              {z.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
              </div>

              <div>
                <FormField
                  control={form.control}
                  name="analyst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analista</FormLabel>
                      <FormControl>
                        <Input type="text" required placeholder="Nombre del analista" {...field} />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
              </div>

              {/* analyzedAt */}
              <div>
                <FormField
                  control={form.control}
                  name="analyzedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de análisis</FormLabel>
                      <FormControl>
                        <input
                          type="date"
                          required
                          placeholder="Fecha de análisis"
                          value={
                            field.value
                              ? new Date(field.value as unknown as Date).toISOString().slice(0, 10)
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={analysisTypeId}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tipo de Análisis
                  </label>
                  <select
                    id={analysisTypeId}
                    name="analysisType"
                    value={form.getValues('analysisType')}
                    onChange={(e) => onChangeAnalysisType(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Selecciona un tipo</option>
                    {AnalysisType.values().map((analysisType) => (
                      <option key={analysisType.value} value={analysisType.value}>
                        {analysisType.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {analysisParams.map((param) => (
                <div key={param}>
                  <FormField
                    control={form.control}
                    name={param as keyof z.infer<typeof createAnalysisSchema>}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{param}</FormLabel>
                        <FormControl>
                          {param === 'description' ? (
                            <textarea
                              placeholder="Descripción"
                              rows={4}
                              name={field.name}
                              onBlur={field.onBlur}
                              onChange={field.onChange}
                              ref={field.ref}
                              value={(field.value as string) ?? ''}
                            />
                          ) : (
                            <Input
                              type="text"
                              placeholder={param}
                              name={field.name}
                              onBlur={field.onBlur}
                              onChange={field.onChange}
                              ref={field.ref}
                              value={(field.value as string) ?? ''}
                            />
                          )}
                          {/* <input type="text" placeholder={param} /> */}
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                      </FormItem>
                    )}
                  ></FormField>
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 w-full">
            <Button className="flex-1" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button className="flex-1" variant="destructive" type="submit">
              Añadir Análisis
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
