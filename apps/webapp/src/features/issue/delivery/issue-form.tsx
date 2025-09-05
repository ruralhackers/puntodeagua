import { DateTime } from 'core'
import type { IssueSchema, WaterZoneDto } from 'features'
import type { CreateIssueSchema } from 'features/issues/schemas/create-issue.schema'
import { CalendarIcon } from 'lucide-react'
import type { FC } from 'react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export const IssueForm: FC<{
  onCancel: () => void
  onSubmit: (data: IssueSchema | CreateIssueSchema) => void
  form: UseFormReturn<IssueSchema | CreateIssueSchema>
  waterZones: WaterZoneDto[]
}> = ({ form, onSubmit, onCancel, waterZones }) => {
  type FormFieldType = ControllerRenderProps<IssueSchema | CreateIssueSchema, any>
  const selectedStatus = form.watch('status')

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, (x) => {
        console.log(x)
      })}
      className="space-y-8"
    >
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-3 mb-4">
          📋 Información Básica
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <FormField
              control={form.control}
              name="waterZoneId"
              render={({ field }: { field: FormFieldType }) => (
                <FormItem>
                  <FormLabel>Zona *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
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
              render={({ field }: { field: FormFieldType }) => (
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
              render={({ field }: { field: FormFieldType }) => (
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
              render={({ field }: { field: FormFieldType }) => (
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
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-semibold border-b border-blue-300 pb-3 mb-4">
          📅 Estado y fechas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <FormField
              control={form.control}
              name="status"
              render={({ field }: { field: FormFieldType }) => (
                <FormItem>
                  <FormLabel>Estado *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem key="open" value="open">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-circle-alert h-4 w-4 text-red-500"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" x2="12" y1="8" y2="12"></line>
                            <line x1="12" x2="12.01" y1="16" y2="16"></line>
                          </svg>
                          <span className="text-red-600">Abierta</span>
                        </SelectItem>
                        <SelectItem key="closed" value="closed">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-circle-check-big h-4 w-4 text-green-500"
                            aria-hidden="true"
                          >
                            <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                            <path d="m9 11 3 3L22 4"></path>
                          </svg>
                          <span className="text-green-600">Cerrada</span>
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

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <FormField
              control={form.control}
              name="startAt"
              render={({ field }: { field: FormFieldType }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de apertura *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
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
              )}
            ></FormField>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <FormField
              control={form.control}
              name="endAt"
              render={({ field }: { field: FormFieldType }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de resolución</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          disabled={selectedStatus !== 'closed'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
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
                        disabled={selectedStatus !== 'closed'}
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
              )}
            ></FormField>
          </div>
        </div>

        {selectedStatus === 'closed' && (
          <div className="p-4 rounded-lg border-2 bg-white border-green-200">
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-circle-check-big h-6 w-6 text-green-600"
                aria-hidden="true"
              >
                <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
                <path d="m9 11 3 3L22 4"></path>
              </svg>
              <div>
                <h4 className="font-semibold text-green-800">✅ Incidencia Cerrada</h4>
                <p className="text-sm text-green-700">
                  Esta incidencia ha sido resuelta satisfactoriamente
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedStatus === 'open' && (
          <div className="p-4 rounded-lg border-2 bg-white border-red-200">
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-circle-alert h-6 w-6 text-red-600"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" x2="12" y1="8" y2="12"></line>
                <line x1="12" x2="12.01" y1="16" y2="16"></line>
              </svg>
              <div>
                <h4 className="font-semibold text-red-800">🔴 Incidencia Abierta</h4>
                <p className="text-sm text-red-700">
                  Esta incidencia requiere atención y seguimiento
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 w-full">
        <Button className="flex-1" type="button" variant="outline" onClick={() => onCancel()}>
          Cancelar
        </Button>
        <Button className="flex-1" variant="default" type="submit">
          Guardar
        </Button>
      </div>
    </form>
  )
}
