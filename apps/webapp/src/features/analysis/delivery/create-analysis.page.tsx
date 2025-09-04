'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Id } from 'core'
import { Analysis } from 'features/registers/entities/analysis'
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
// import { useUseCase } from '@/src/core/use-cases/use-use-case'

export const CreateAnalysisPage: NextPage = () => {
  const router = useRouter()
  const createAnalysisCommand = useUseCase(CreateAnalysisCmd)

  const createAnalysisSchema = analysisSchema.omit({ id: true })

  // const analysisParams = ['ph', 'turbidity', 'chlorine']

  const form = useForm<z.infer<typeof createAnalysisSchema>>({
    resolver: zodResolver(createAnalysisSchema),
    defaultValues: {
      description: '',
      waterZoneId: Id.generateUniqueId().toString(),
      analysisType: '',
      analyst: '',
      analyzedAt: new Date(),
      ph: '',
      turbidity: '',
      chlorine: ''
      // tipo: '',
      // prioridad: '',
      // puntoAgua: '',
      // fecha: '',
      // hora: '',
      // reportadoPor: '',
      // descripcion: '',
      // accionesRealizadas: '',
      // observaciones: ''
    }
  })

  const selectedType = form.watch('analysisType')
  const analysisTypeId = useId()
  const analysisParams = useMemo(() => {
    if (!selectedType || !AnalysisType.isValidType(selectedType)) return []
    return AnalysisType.create(selectedType).getFieldsByType()
  }, [selectedType])

  async function onSubmit(values: z.infer<typeof createAnalysisSchema>) {
    console.log('Datos del análisis:', values)
    const analysis = Analysis.create(values)
    await createAnalysisCommand.execute(analysis.toDto())
    // await createAnalysisCommand.execute(values)
    // Aquí iría la lógica para guardar la incidencia cuando tengamos waterZoneId
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
                  render={() => (
                    <FormItem>
                      <FormLabel>Fecha de análisis</FormLabel>
                      <FormControl>
                        <input type="date" required placeholder="Fecha de análisis" />
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

              {/* description use textarea */}
              {/* <div>
                <FormField
                  control={form.control}
                  name="description"
                  render={() => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <textarea placeholder="Describe brevemente el análisis" rows={4} />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
              </div> */}

              {/*      <div>*/}
              {/*        <label className="block text-sm font-medium text-gray-700 mb-2">*/}
              {/*          Prioridad **/}
              {/*        </label>*/}
              {/*        <select*/}
              {/*          name="prioridad"*/}
              {/*          value={formData.prioridad}*/}
              {/*          onChange={handleInputChange}*/}
              {/*          required*/}
              {/*          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"*/}
              {/*        >*/}
              {/*          <option value="">Selecciona prioridad</option>*/}
              {/*          {prioridades.map((prioridad) => (*/}
              {/*            <option key={prioridad.value} value={prioridad.value}>*/}
              {/*              {prioridad.label}*/}
              {/*            </option>*/}
              {/*          ))}*/}
              {/*        </select>*/}
              {/*      </div>*/}
              {/*    </div>*/}

              {/*    <div>*/}
              {/*      <label className="block text-sm font-medium text-gray-700 mb-2">*/}
              {/*        Punto de Agua Afectado **/}
              {/*      </label>*/}
              {/*      <select*/}
              {/*        name="puntoAgua"*/}
              {/*        value={formData.puntoAgua}*/}
              {/*        onChange={handleInputChange}*/}
              {/*        required*/}
              {/*        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"*/}
              {/*      >*/}
              {/*        <option value="">Selecciona un punto</option>*/}
              {/*        {puntosAgua.map((punto) => (*/}
              {/*          <option key={punto} value={punto}>*/}
              {/*            {punto}*/}
              {/*          </option>*/}
              {/*        ))}*/}
              {/*      </select>*/}
              {/*    </div>*/}

              {/*    <div className="grid grid-cols-2 gap-4">*/}
              {/*      <div>*/}
              {/*        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>*/}
              {/*        <input*/}
              {/*          type="date"*/}
              {/*          name="fecha"*/}
              {/*          value={formData.fecha}*/}
              {/*          onChange={handleInputChange}*/}
              {/*          required*/}
              {/*          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"*/}
              {/*        />*/}
              {/*      </div>*/}
              {/*      <div>*/}
              {/*        <label className="block text-sm font-medium text-gray-700 mb-2">Hora *</label>*/}
              {/*        <input*/}
              {/*          type="time"*/}
              {/*          name="hora"*/}
              {/*          value={formData.hora}*/}
              {/*          onChange={handleInputChange}*/}
              {/*          required*/}
              {/*          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"*/}
              {/*        />*/}
              {/*      </div>*/}
              {/*    </div>*/}

              {/*    <div>*/}
              {/*      <label className="block text-sm font-medium text-gray-700 mb-2">*/}
              {/*        Reportado por **/}
              {/*      </label>*/}
              {/*      <input*/}
              {/*        type="text"*/}
              {/*        name="reportadoPor"*/}
              {/*        value={formData.reportadoPor}*/}
              {/*        onChange={handleInputChange}*/}
              {/*        required*/}
              {/*        placeholder="Nombre de quien reporta"*/}
              {/*        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"*/}
              {/*      />*/}
              {/*    </div>*/}
              {/*  </div>*/}
              {/*</div>*/}

              {/*/!* Descripción *!/*/}
              {/*<div className="bg-white border border-gray-200 rounded-lg p-4">*/}
              {/*  <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción del Problema</h3>*/}

              {/*  <div>*/}
              {/*    <label className="block text-sm font-medium text-gray-700 mb-2">*/}
              {/*      Descripción detallada **/}
              {/*    </label>*/}
              {/*    <textarea*/}
              {/*      name="descripcion"*/}
              {/*      value={formData.descripcion}*/}
              {/*      onChange={handleInputChange}*/}
              {/*      required*/}
              {/*      rows={4}*/}
              {/*      placeholder="Describe detalladamente el problema, síntomas observados, área afectada, etc."*/}
              {/*      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*</div>*/}

              {/*/!* Acciones realizadas *!/*/}
              {/*<div className="bg-white border border-gray-200 rounded-lg p-4">*/}
              {/*  <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Inmediatas</h3>*/}

              {/*  <div>*/}
              {/*    <label className="block text-sm font-medium text-gray-700 mb-2">*/}
              {/*      Acciones realizadas (si las hay)*/}
              {/*    </label>*/}
              {/*    <textarea*/}
              {/*      name="accionesRealizadas"*/}
              {/*      value={formData.accionesRealizadas}*/}
              {/*      onChange={handleInputChange}*/}
              {/*      rows={3}*/}
              {/*      placeholder="Describe las acciones inmediatas que se han tomado para mitigar el problema"*/}
              {/*      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"*/}
              {/*    />*/}
              {/*  </div>*/}
              {/*</div>*/}

              {/*/!* Observaciones *!/*/}
              {/*<div className="bg-white border border-gray-200 rounded-lg p-4">*/}
              {/*  <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>*/}

              {/*  <div>*/}
              {/*    <label className="block text-sm font-medium text-gray-700 mb-2">*/}
              {/*      Observaciones adicionales*/}
              {/*    </label>*/}
              {/*    <textarea*/}
              {/*      name="observaciones"*/}
              {/*      value={formData.observaciones}*/}
              {/*      onChange={handleInputChange}*/}
              {/*      rows={3}*/}
              {/*      placeholder="Cualquier información adicional relevante"*/}
              {/*      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"*/}
              {/*    />*/}
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
