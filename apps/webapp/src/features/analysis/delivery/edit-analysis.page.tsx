'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { AnalysisDto } from 'features'
import { Analysis } from 'features/registers/entities/analysis'
import { analysisSchema } from 'features/registers/schemas/analysis.schema'
import { AnalysisType } from 'features/registers/value-objects/analysis-type'
import { useRouter } from 'next/navigation'
import { type FC, useId, useMemo } from 'react'
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
import { EditAnalysisCmd } from '../application/edit-analysis.cmd'
// import { useUseCase } from '@/<src/core/use-cases/use-use-case'

export const EditAnalysisPage: FC<{ analysis: Analysis }> = ({ analysis }) => {
  const router = useRouter()

  const editAnalysisCommand = useUseCase(EditAnalysisCmd)

  const form = useForm<z.infer<typeof analysisSchema>>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      ...analysis.toDto()
    }
  })

  const selectedType = form.watch('analysisType')
  const analysisTypeId = useId()
  const analysisParams = useMemo(() => {
    if (!selectedType || !AnalysisType.isValidType(selectedType)) return []
    return AnalysisType.create(selectedType).getFieldsByType()
  }, [selectedType])

  async function onSubmit(values: z.infer<typeof editAnalysisCommand>) {
    const analysis = Analysis.fromDto(values)
    await editAnalysisCommand.execute(analysis.toDto())
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
                  name="analyst"
                  render={() => (
                    <FormItem>
                      <FormLabel>Analista</FormLabel>
                      <FormControl>
                        <input type="text" placeholder="Nombre del analista" />
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
                  render={() => (
                    <FormItem>
                      <FormLabel>Fecha de análisis</FormLabel>
                      <FormControl>
                        <input type="date" placeholder="Fecha de análisis" />
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
                    Tipo de Incidencia
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

              {/* add form field for each analysis params with a label */}
              {analysisParams.map((param) => (
                <div key={param}>
                  <FormField
                    control={form.control}
                    name={param as keyof z.infer<typeof createAnalysisSchema>}
                    render={() => (
                      <FormItem>
                        <FormLabel>{param}</FormLabel>
                        <FormControl>
                          {param === 'description' ? (
                            <textarea placeholder="Descripción" rows={4} />
                          ) : (
                            <Input type="text" placeholder={param} />
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
              Reportar Incidencia
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
