import type { IssueSchema, WaterZoneDto } from 'features'
import type { CreateIssueSchema } from 'features/schemas/create-issue.schema'
import type { FC } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
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
import { Textarea } from '@/components/ui/textarea'

export const IssueForm: FC<{
  onCancel: () => void
  onSubmit: (data: IssueSchema | CreateIssueSchema) => void
  form: UseFormReturn<IssueSchema | CreateIssueSchema>
  waterZones: WaterZoneDto[]
}> = ({ form, onSubmit, onCancel, waterZones }) => {
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (x) => {
        console.log(x)
      })}
      className="space-y-8"
    >
      {/* Información básica */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <FormField
              control={form.control}
              name="waterZoneId"
              render={() => (
                <FormItem>
                  <FormLabel>Zona *</FormLabel>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {waterZones.map((wz) => (
                        <SelectItem key={wz.id} value={wz.id}>
                          {wz.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            ></FormField>
          </div>

          <div>
            <FormField
              control={form.control}
              name="reporterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona que firma *</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Nombre de quien firma la incidencia"
                      {...field}
                      required
                    />
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incidencia *</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Título de la incidencia"
                      {...field}
                      required
                    ></Input>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción de la incidencia</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      name="description"
                      placeholder="Describe detalladamente la incidencia"
                      rows={4}
                      cols={40}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
          </div>

          <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 border-b border-blue-300 pb-3 mb-4">
              📅 Estado y fechas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <FormField
                  control={form.control}
                  name="status"
                  render={() => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <FormControl>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="open" value="open">
                              Abierta
                            </SelectItem>
                            <SelectItem key="closed" value="closed">
                              Cerrada
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                ></FormField>
              </div>

              <div className="bg-white rounded-lg p-4 border border-blue-200"></div>
            </div>
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

      <div className="flex gap-3 w-full">
        <Button className="flex-1" type="button" onClick={() => onCancel()}>
          Cancelar
        </Button>
        <Button className="flex-1" variant="destructive" type="submit">
          Reportar Incidencia
        </Button>
      </div>
    </form>
  )
}
