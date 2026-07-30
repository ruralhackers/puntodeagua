'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { CommunityZoneDto, WaterDepositDto } from '@pda/community'
import { Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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
import { useIsMobile } from '@/hooks/use-mobile'
import { buildMapsHref } from '@/lib/maps-link'
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
  fixedPopulation: z.number().int().min(0),
  floatingPopulation: z.number().int().min(0),
  cadastralReference: z.string().min(1, 'La referencia catastral es requerida'),
  notes: z.string().optional(),
  communityZoneId: z.string().min(1, 'La zona es requerida'),
  waterDepositIds: z.array(z.string())
})

interface WaterPointDataFormProps {
  waterPointId: string
  communityId: string
  onClose: () => void
  onSuccess: () => void
}

export default function WaterPointDataForm({
  waterPointId,
  communityId,
  onClose,
  onSuccess
}: WaterPointDataFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: waterPoint } = api.community.getWaterPointById.useQuery({ id: waterPointId })
  const { data: zones } = api.community.getCommunityZones.useQuery({
    id: communityId
  })
  const { data: allDeposits } = api.community.getWaterDepositsByCommunityId.useQuery({
    id: communityId
  })

  const utils = api.useUtils()
  const isMobile = useIsMobile()

  const updateMutation = api.community.updateWaterPointData.useMutation({
    onSuccess: async () => {
      toast.success('Datos actualizados exitosamente')
      // Invalidate and refetch the list
      await utils.community.getWaterPointsByCommunityWithAccount.invalidate()
      await utils.community.getWaterPointById.invalidate()
      onSuccess()
    },
    onError: (error) => {
      toast.error('Error al actualizar datos', {
        description: error.message
      })
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      mapsUrl: '',
      connectionNumber: '',
      fixedPopulation: 0,
      floatingPopulation: 0,
      cadastralReference: '',
      notes: '',
      communityZoneId: '',
      waterDepositIds: []
    }
  })

  // Update form when water point data is loaded
  useEffect(() => {
    if (waterPoint) {
      form.reset({
        name: waterPoint.name,
        location: waterPoint.location || '',
        mapsUrl: waterPoint.mapsUrl || '',
        connectionNumber: waterPoint.connectionNumber || '',
        fixedPopulation: waterPoint.fixedPopulation,
        floatingPopulation: waterPoint.floatingPopulation,
        cadastralReference: waterPoint.cadastralReference,
        notes: waterPoint.notes || '',
        communityZoneId: waterPoint.communityZoneId,
        waterDepositIds: waterPoint.waterDepositIds || []
      })
    }
  }, [waterPoint, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      await updateMutation.mutateAsync({
        waterPointId: waterPointId,
        name: values.name,
        location: values.location,
        mapsUrl: values.mapsUrl?.trim() ? values.mapsUrl.trim() : null,
        connectionNumber: values.connectionNumber?.trim() ? values.connectionNumber.trim() : null,
        fixedPopulation: values.fixedPopulation,
        floatingPopulation: values.floatingPopulation,
        cadastralReference: values.cadastralReference,
        notes: values.notes,
        communityZoneId: values.communityZoneId,
        waterDepositIds: values.waterDepositIds
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const identityFields = (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Casa</FormLabel>
            <FormControl>
              <Input placeholder="Nombre de la casa" {...field} />
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
            <FormLabel>Nº enganche (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Ej: B62 o obra" {...field} />
            </FormControl>
            <FormDescription>
              Puedes pasar de un valor temporal (obra) al número definitivo
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={isMobile ? '' : 'sm:max-w-[600px]'} fullscreenOnMobile>
        {isMobile ? (
          // Mobile fullscreen layout
          <>
            <DialogTitle className="sr-only">Editar Datos de Casa</DialogTitle>
            {/* Sticky header with save and close buttons */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-2">
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Editar Datos de Casa</h2>
                <p className="text-sm text-muted-foreground">
                  Actualiza el nombre, ubicación, nº enganche y el resto de datos
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {identityFields}

                  <FormField
                    control={form.control}
                    name="fixedPopulation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Población Fija</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Número de personas que viven permanentemente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="floatingPopulation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Población Flotante</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Número de personas que vienen temporalmente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cadastralReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referencia Catastral</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 12345678AB1234CD" {...field} />
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
                          <Textarea
                            placeholder="Notas adicionales sobre la casa"
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
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
                        <FormLabel>Zona de la Comunidad</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="waterDepositIds"
                    render={() => (
                      <FormItem>
                        <FormLabel>Depósitos de Agua</FormLabel>
                        <FormDescription>
                          Selecciona los depósitos que abastecen esta casa
                        </FormDescription>
                        {allDeposits?.map((deposit: WaterDepositDto) => (
                          <FormField
                            key={deposit.id}
                            control={form.control}
                            name="waterDepositIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={deposit.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(deposit.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, deposit.id])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== deposit.id)
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{deposit.name}</FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </>
        ) : (
          // Desktop layout
          <>
            <DialogHeader>
              <DialogTitle>Editar Datos de Casa</DialogTitle>
              <DialogDescription>
                Actualiza el nombre, ubicación, nº enganche y el resto de datos
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {identityFields}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fixedPopulation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Población Fija</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Personas permanentes</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="floatingPopulation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Población Flotante</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Personas temporales</FormDescription>
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
                      <FormLabel>Referencia Catastral</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 12345678AB1234CD" {...field} />
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
                        <Textarea
                          placeholder="Notas adicionales sobre la casa"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
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
                      <FormLabel>Zona de la Comunidad</FormLabel>
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

                <FormField
                  control={form.control}
                  name="waterDepositIds"
                  render={() => (
                    <FormItem>
                      <FormLabel>Depósitos de Agua</FormLabel>
                      <FormDescription>
                        Selecciona los depósitos que abastecen esta casa
                      </FormDescription>
                      {allDeposits?.map((deposit: WaterDepositDto) => (
                        <FormField
                          key={deposit.id}
                          control={form.control}
                          name="waterDepositIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={deposit.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(deposit.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, deposit.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== deposit.id)
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{deposit.name}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
