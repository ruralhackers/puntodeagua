'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Issue, issueSchema } from 'features'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
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
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { SaveIssueCmd } from '@/src/features/issue/application/save-issue.cmd'

const tiposIncidencia = [
  'Fuga de agua',
  'Baja presión',
  'Corte de suministro',
  'Calidad del agua',
  'Avería en bomba',
  'Problema eléctrico',
  'Obstrucción en tubería',
  'Otro'
]

const prioridades = [
  { value: 'baja', label: 'Baja', color: 'text-green-600' },
  { value: 'media', label: 'Media', color: 'text-yellow-600' },
  { value: 'alta', label: 'Alta', color: 'text-orange-600' },
  { value: 'critica', label: 'Crítica', color: 'text-red-600' }
]

const puntosAgua = [
  'Pozo Principal',
  'Tanque Elevado Norte',
  'Tanque Elevado Sur',
  'Red Distribución Centro',
  'Red Distribución Periferia',
  'Estación de Bombeo'
]

export const CreateIssuePage: NextPage = () => {
  const router = useRouter()
  const saveIssueCommand = useUseCase(SaveIssueCmd)

  const form = useForm<z.infer<typeof issueSchema>>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: '',
      waterZoneId: ''
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

  async function onSubmit(values: z.infer<typeof issueSchema>) {
    await saveIssueCommand.execute(Issue.create({ title: values.title, waterZoneId: '' }))
    router.push('/')
  }

  return (
    <div className="px-3 py-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Incidencia</h1>
          <p className="text-gray-600">Reporta una nueva incidencia o problema</p>
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
                  name="title"
                  render={() => (
                    <FormItem>
                      <FormLabel />
                      <FormControl>
                        <input type="text" placeholder="Describe brevemente la incidencia" />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
              </div>

              {/*    <div className="grid grid-cols-2 gap-4">*/}
              {/*      <div>*/}
              {/*        <label className="block text-sm font-medium text-gray-700 mb-2">*/}
              {/*          Tipo de Incidencia **/}
              {/*        </label>*/}
              {/*        <select*/}
              {/*          name="tipo"*/}
              {/*          value={formData.tipo}*/}
              {/*          onChange={handleInputChange}*/}
              {/*          required*/}
              {/*          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"*/}
              {/*        >*/}
              {/*          <option value="">Selecciona un tipo</option>*/}
              {/*          {tiposIncidencia.map((tipo) => (*/}
              {/*            <option key={tipo} value={tipo}>*/}
              {/*              {tipo}*/}
              {/*            </option>*/}
              {/*          ))}*/}
              {/*        </select>*/}
              {/*      </div>*/}

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
