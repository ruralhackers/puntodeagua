'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { AnalysisDto, WaterZone, WaterZoneDto } from 'features'
import { Analysis } from 'features/registers/entities/analysis'
import { analysisSchema } from 'features/registers/schemas/analysis.schema'
import { AnalysisType } from 'features/registers/value-objects/analysis-type'
import { useRouter } from 'next/navigation'
import type { FC } from 'react'
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
import { FormHeader } from '../../../components/analysis/form-header'
import { EditAnalysisCmd } from '../application/edit-analysis.cmd'
// import { useUseCase } from '@/<src/core/use-cases/use-use-case'

export const EditAnalysisPage: FC<{ analysis: AnalysisDto; waterZone: WaterZoneDto }> = ({
  analysis,
  waterZone
}) => {
  const router = useRouter()
  const editAnalysisCommand = useUseCase(EditAnalysisCmd)

  const form = useForm<z.infer<typeof analysisSchema>>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      ...analysis,
      analyzedAt: analysis.analyzedAt ? new Date(analysis.analyzedAt) : undefined
    }
  })

  const analysisParams = AnalysisType.create(analysis.analysisType).getFieldsByType()

  async function onSubmit(values: z.infer<typeof analysisSchema>) {
    const analysisEntity = Analysis.fromDto(values)
    await editAnalysisCommand.execute(analysisEntity.toDto())
    router.push('/')
  }

  return (
    <div className="px-3 py-4 pb-20">
      {/* Header */}
      <FormHeader title="Editar análisis" subtitle="Actualiza los datos del análisis" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <FormField
                  control={form.control}
                  name="waterZoneId"
                  render={({ field }) => {
                    const zoneName = waterZone?.name ?? 'No encontrada'
                    return (
                      <FormItem>
                        <FormLabel>Zona de Agua</FormLabel>
                        <FormControl>
                          <>
                            <input type="hidden" {...field} />
                            <Input type="text" value={zoneName} disabled />
                          </>
                        </FormControl>
                        <FormDescription />
                        <FormMessage />
                      </FormItem>
                    )
                  }}
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
                            field.value ? new Date(field.value).toISOString().slice(0, 10) : ''
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
                    htmlFor="analysisTypeId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tipo de Análisis
                  </label>
                  <select
                    id={'analysisTypeId'}
                    name="analysisType"
                    value={form.getValues('analysisType')}
                    disabled
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value={form.getValues('analysisType')}>
                      {form.getValues('analysisType')}
                    </option>
                  </select>
                </div>
              </div>

              {analysisParams.map((param) => (
                <div key={param}>
                  <FormField
                    control={form.control}
                    name={param as keyof z.infer<typeof analysisSchema>}
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

          <div className="flex gap-3 w-full">
            <Button className="flex-1" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button className="flex-1" variant="destructive" type="submit">
              Actualizar Análisis
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
