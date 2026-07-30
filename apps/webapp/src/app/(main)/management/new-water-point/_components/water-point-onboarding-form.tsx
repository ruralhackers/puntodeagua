'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { CommunityZoneDto } from '@pda/community'
import type { WaterDepositDto } from '@pda/community/domain/entities/water-deposit.dto'
import { Gauge, House, Loader2, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { buildMapsHref } from '@/lib/maps-link'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  location: z.string(),
  mapsUrl: z
    .string()
    .optional()
    .refine((value) => !value?.trim() || buildMapsHref(value) !== null, {
      message: 'Pega un enlace de Google Maps (https://…) o coordenadas «lat,lng»'
    }),
  connectionNumber: z.string().optional(),
  communityZoneId: z.string().min(1, 'La zona es requerida'),
  fixedPopulation: z.number().int().min(0),
  floatingPopulation: z.number().int().min(0),
  cadastralReference: z.string().min(1, 'La referencia catastral es requerida'),
  notes: z.string().optional(),
  waterDepositIds: z.array(z.string()),
  accountName: z.string().min(1, 'El nombre del titular es requerido'),
  nationalId: z.string().min(1, 'El DNI/NIE es requerido'),
  phone: z.string().optional(),
  accountNotes: z.string().optional(),
  meterName: z.string().min(1, 'El nombre del contador es requerido'),
  measurementUnit: z.enum(['L', 'M3']),
  initialReading: z.string().optional(),
  initialReadingDate: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

export default function WaterPointOnboardingForm() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id || ''

  const { data: zones } = api.community.getCommunityZones.useQuery(
    { id: communityId },
    { enabled: !!communityId }
  )
  const { data: allDeposits } = api.community.getWaterDepositsByCommunityId.useQuery(
    { id: communityId },
    { enabled: !!communityId }
  )

  const createMutation = api.community.createWaterPointOnboarding.useMutation({
    onSuccess: (result: { waterMeterId: string; accountReused: boolean }) => {
      toast.success(
        result.accountReused
          ? 'Punto de agua creado (titular reutilizado)'
          : 'Punto de agua creado correctamente'
      )
      router.push(`/water-meter/${result.waterMeterId}`)
    },
    onError: (error: { message: string }) => {
      toast.error('Error al crear el punto de agua', {
        description: error.message
      })
    }
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      mapsUrl: '',
      connectionNumber: '',
      communityZoneId: '',
      fixedPopulation: 0,
      floatingPopulation: 0,
      cadastralReference: '',
      notes: '',
      waterDepositIds: [],
      accountName: '',
      nationalId: '',
      phone: '',
      accountNotes: '',
      meterName: '',
      measurementUnit: 'M3',
      initialReading: '',
      initialReadingDate: ''
    }
  })

  async function onSubmit(values: FormValues) {
    await createMutation.mutateAsync({
      name: values.name,
      location: values.location,
      mapsUrl: values.mapsUrl?.trim() || undefined,
      connectionNumber: values.connectionNumber?.trim() || undefined,
      communityZoneId: values.communityZoneId,
      fixedPopulation: values.fixedPopulation,
      floatingPopulation: values.floatingPopulation,
      cadastralReference: values.cadastralReference,
      notes: values.notes || undefined,
      waterDepositIds: values.waterDepositIds,
      accountName: values.accountName,
      nationalId: values.nationalId,
      phone: values.phone || undefined,
      accountNotes: values.accountNotes || undefined,
      meterName: values.meterName,
      measurementUnit: values.measurementUnit,
      initialReading: values.initialReading?.trim() || undefined,
      initialReadingDate: values.initialReadingDate
        ? new Date(values.initialReadingDate)
        : undefined
    })
  }

  if (!communityId) {
    return (
      <p className="text-muted-foreground">
        No tienes una comunidad asignada. No se puede crear un punto de agua.
      </p>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Card className="overflow-hidden border-sky-100 bg-white shadow-sm">
          <CardHeader className="border-b border-sky-100 bg-sky-50/70 px-6 py-5 md:px-8">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
                <House className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-950">Casa y ubicación</CardTitle>
                <CardDescription className="mt-1 text-slate-600">
                  Identifica el punto y sitúalo dentro de la comunidad.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6 py-6 md:px-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Casa Posse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección o coordenadas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mapsUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enlace de Google Maps</FormLabel>
                  <FormControl>
                    <Input placeholder="https://maps.app.goo.gl/… o 42.2286,-8.4589" {...field} />
                  </FormControl>
                  <FormDescription>
                    Abre el punto en Google Maps, comparte la ubicación y pega aquí el enlace.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="connectionNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nº de conexión (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: C32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="communityZoneId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una zona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {zones?.map((zone: CommunityZoneDto) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fixedPopulation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Población fija</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="floatingPopulation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Población flotante</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cadastralReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia catastral</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="waterDepositIds"
              render={() => (
                <FormItem>
                  <FormLabel>Depósitos</FormLabel>
                  <FormDescription>Opcional. Selecciona los depósitos asociados.</FormDescription>
                  <div className="space-y-2">
                    {allDeposits?.map((deposit: WaterDepositDto) => (
                      <FormField
                        key={deposit.id}
                        control={form.control}
                        name="waterDepositIds"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(deposit.id)}
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? [...(field.value ?? []), deposit.id]
                                    : (field.value ?? []).filter((id) => id !== deposit.id)
                                  field.onChange(next)
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{deposit.name}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-emerald-100 bg-white shadow-sm">
          <CardHeader className="border-b border-emerald-100 bg-emerald-50/70 px-6 py-5 md:px-8">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <UserRound className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-950">Titular</CardTitle>
                <CardDescription className="mt-1 text-slate-600">
                  Si el DNI ya existe en esta comunidad, se reutilizará la cuenta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6 py-6 md:px-8">
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del titular</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nationalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI / NIE</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas del titular (opcional)</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-violet-100 bg-white shadow-sm">
          <CardHeader className="border-b border-violet-100 bg-violet-50/70 px-6 py-5 md:px-8">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                <Gauge className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-950">Contador</CardTitle>
                <CardDescription className="mt-1 text-slate-600">
                  Lectura inicial opcional si el contador ya está instalado
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6 py-6 md:px-8">
            <FormField
              control={form.control}
              name="meterName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del contador</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: C32 Posse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="measurementUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad de medida</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M3">m³</SelectItem>
                      <SelectItem value="L">Litros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="initialReading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lectura inicial (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 12.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="initialReadingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha lectura inicial</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/90 shadow-sm">
          <CardContent className="flex flex-col-reverse gap-3 p-4 sm:flex-row sm:justify-end sm:p-5">
            <Button type="button" variant="outline" asChild className="sm:min-w-28">
              <Link href="/management">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="sm:min-w-52">
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear punto de agua
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
