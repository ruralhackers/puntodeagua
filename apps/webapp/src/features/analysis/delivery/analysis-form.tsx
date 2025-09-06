'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import { DateTime } from 'core'
import type { WaterZoneDto } from 'features'
import { AnalysisType } from 'features/registers/value-objects/analysis-type'
import { CalendarIcon } from 'lucide-react'
import type { FC } from 'react'
import { useId, useMemo } from 'react'
import type { ControllerRenderProps, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '../../../../lib/utils'

export const AnalysisForm: FC<{
  onCancel: () => void
  onSubmit: (data: any) => void
  form: UseFormReturn<any>
  waterZones: WaterZoneDto[]
  isEdit?: boolean
  waterZone?: WaterZoneDto
}> = ({ form, onSubmit, onCancel, waterZones, isEdit = false, waterZone }) => {
  type FormFieldType = ControllerRenderProps<any, any>

  const selectedType = form.watch('analysisType')
  const analysisTypeId = useId()
  const analysisParams = useMemo(() => {
    if (!selectedType || !AnalysisType.isValidType(selectedType)) return []
    return AnalysisType.create(selectedType).getFieldsByType()
  }, [selectedType])

  function onChangeAnalysisType(value: string) {
    form.setValue('analysisType', value, { shouldValidate: true })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Información básica */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <FormField
              control={form.control}
              name="waterZoneId"
              render={({ field }) => {
                if (isEdit && waterZone) {
                  const zoneName = waterZone?.name ?? 'No encontrada'
                  return (
                    <FormItem>
                      <FormLabel>Zona de Agua</FormLabel>
                      <FormControl>
                        <div>
                          <input type="hidden" {...field} />
                          <Input type="text" value={zoneName} disabled />
                        </div>
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )
                }

                return (
                  <FormItem>
                    <FormLabel>Zona de Agua</FormLabel>
                    <FormControl>
                      <select
                        required
                        value={field.value}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          field.onChange(e.target.value)
                        }
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
                )
              }}
            />
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
            />
          </div>

          {/* analyzedAt */}
          <FormField
            control={form.control}
            name="analyzedAt"
            render={({ field }: { field: FormFieldType }) => {
              if (isEdit) {
                return (
                  <FormItem>
                    <FormLabel>Fecha de análisis</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        required
                        placeholder="Fecha de análisis"
                        value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.onChange(
                            e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )
              }

              return (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de análisis *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full md:w-[240px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            DateTime.fromISO(field.value).format('cccc, dd LLL yyyy')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? DateTime.fromISO(field.value).toDate() : undefined}
                        onSelect={(x: Date | undefined, ...args: any[]) => {
                          if (x) {
                            field.onChange(DateTime.fromDate(x).toISO(), ...args)
                          } else {
                            field.onChange('', ...args)
                          }
                        }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  onChangeAnalysisType(e.target.value)
                }
                disabled={isEdit}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Selecciona un tipo</option>
                {AnalysisType.values().map((analysisType) => (
                  <option key={analysisType.value} value={analysisType.value}>
                    {analysisType.getLabel()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {analysisParams.map((param) => (
            <div key={param}>
              <FormField
                control={form.control}
                name={param as string}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedType && AnalysisType.isValidType(selectedType)
                        ? AnalysisType.create(selectedType).getFieldLabel(param)
                        : param}
                    </FormLabel>
                    <FormControl>
                      {param === 'description' ? (
                        <Textarea
                          placeholder="Descripción del análisis"
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
                          placeholder={
                            selectedType && AnalysisType.isValidType(selectedType)
                              ? `Ingrese ${AnalysisType.create(selectedType).getFieldLabel(param).toLowerCase()}`
                              : param
                          }
                          name={field.name}
                          onBlur={field.onBlur}
                          onChange={field.onChange}
                          ref={field.ref}
                          value={(field.value as string) ?? ''}
                        />
                      )}
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 w-full">
        <Button className="flex-1" type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button className="flex-1" variant="default" type="submit">
          {isEdit ? 'Guardar Cambios' : 'Añadir Análisis'}
        </Button>
      </div>
    </form>
  )
}
