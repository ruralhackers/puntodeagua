'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { MaintenanceSchema, WaterZoneDto } from 'features'
import type { WaterZone } from 'features/entities/water-zone'
import { maintenanceSchema } from 'features/maintenance/schemas/maintenance.schema'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { type ControllerRenderProps, useForm } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { GetWaterZonesQry } from '@/src/features/water-zone/application/get-water-zones.qry'
import { EditMaintenanceCmd } from '../application/edit-maintenance.cmd'

type FormValues = z.infer<typeof maintenanceSchema>
type FormFieldType = ControllerRenderProps<FormValues, any>

export const EditMaintenancePage: NextPage<{
  maintenance: MaintenanceSchema
  waterZone: WaterZoneDto
}> = ({ maintenance }) => {
  const router = useRouter()
  const editMaintenanceCommand = useUseCase(EditMaintenanceCmd)

  const form = useForm<FormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      ...maintenance,
      scheduledDate: maintenance.scheduledDate ? new Date(maintenance.scheduledDate) : undefined,
      executionDate: maintenance.executionDate ? new Date(maintenance.executionDate) : undefined,
      nextMaintenanceDate: maintenance.nextMaintenanceDate
        ? new Date(maintenance.nextMaintenanceDate)
        : undefined
    }
  })

  const { data: waterZones } = useUseCase(GetWaterZonesQry, { immediate: true })

  async function onSubmit(values: FormValues) {
    await editMaintenanceCommand.execute(values)
    router.push(`/dashboard/registros/mantenimiento`)
  }

  return (
    <div className="px-3 py-4 pb-20">
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
          <h1 className="text-2xl font-bold text-gray-900">Editar Mantenimiento</h1>
          <p className="text-gray-600">Actualiza los datos del mantenimiento</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* name */}
              <div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }: { field: FormFieldType }) => (
                    <FormItem>
                      <FormLabel>Objeto del Mantenimiento</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          required
                          placeholder="Ej. Depósito, Bomba..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* scheduledDate */}
              <div>
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }: { field: FormFieldType }) => (
                    <FormItem>
                      <FormLabel>Fecha de Realización</FormLabel>
                      <FormControl>
                        <input
                          type="date"
                          required
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
                />
              </div>

              {/* responsible */}
              <div>
                <FormField
                  control={form.control}
                  name="responsible"
                  render={({ field }: { field: FormFieldType }) => (
                    <FormItem>
                      <FormLabel>Persona/Empresa responsable</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          required
                          placeholder="Nombre de la persona o empresa"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* waterZoneId */}
              <div>
                <FormField
                  control={form.control}
                  name="waterZoneId"
                  render={({ field }: { field: FormFieldType }) => (
                    <FormItem>
                      <FormLabel>Zona del Mantenimiento</FormLabel>
                      <FormControl>
                        <select
                          required
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Selecciona la zona</option>
                          {(waterZones ?? []).map((z: WaterZone) => (
                            <option key={z.id.toString()} value={z.id.toString()}>
                              {z.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* executionDate */}
              <div>
                <FormField
                  control={form.control}
                  name="executionDate"
                  render={({ field }: { field: FormFieldType }) => (
                    <FormItem>
                      <FormLabel>Fecha de Ejecución</FormLabel>
                      <FormControl>
                        <input
                          type="date"
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
                />
              </div>

              {/* nextMaintenanceDate */}
              <div>
                <FormField
                  control={form.control}
                  name="nextMaintenanceDate"
                  render={({ field }: { field: FormFieldType }) => (
                    <FormItem>
                      <FormLabel>Próxima Fecha de Mantenimiento</FormLabel>
                      <FormControl>
                        <input
                          type="date"
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
                />
              </div>

              {/* duration */}
              <div>
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }: { field: FormFieldType }) => (
                    <FormItem>
                      <FormLabel>Duración (horas)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej. 2"
                          value={field.value ?? ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* description */}
              <div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }: { field: FormFieldType }) => (
                    <FormItem>
                      <FormLabel>Descripción del mantenimiento</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Describe las actividades realizadas"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* observations */}
              <div>
                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }: { field: FormFieldType }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Observaciones adicionales" {...field} />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button className="flex-1" type="button" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button className="flex-1" variant="destructive" type="submit">
              Actualizar Mantenimiento
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
