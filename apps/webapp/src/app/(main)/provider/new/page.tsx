'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { providerSchema } from '@pda/providers/domain/entities/provider.dto'
import { ArrowLeft, Building2, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import PageContainer from '@/components/layout/page-container'
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
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'

const formSchema = providerSchema.omit({ id: true })
type FormData = z.infer<typeof formSchema>

export default function NewProviderPage() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      taxId: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      secondaryPhone: '',
      billingEmail: '',
      address: '',
      city: '',
      postalCode: '',
      province: '',
      providerType: 'plumbing',
      isActive: true,
      notes: '',
      businessHours: '',
      emergencyAvailable: false,
      emergencyPhone: '',
      bankAccount: '',
      paymentTerms: '',
      website: '',
      communityId: communityId || undefined
    }
  })

  const createProviderMutation = api.providers.addProvider.useMutation({
    onSuccess: () => {
      toast.success('Proveedor creado')
      router.push('/provider')
    },
    onError: (error) => {
      toast.error(error.message || 'No se pudo crear el proveedor.')
      setIsSubmitting(false)
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    createProviderMutation.mutate(data)
  }

  if (!communityId) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          No se pudo determinar la comunidad del usuario
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/provider">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nuevo Proveedor</h1>
            <p className="text-muted-foreground">Registra un nuevo proveedor de servicios</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información Básica
                </CardTitle>
                <CardDescription>Datos principales del proveedor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Empresa *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Fontanería García" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CIF/NIF</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: B12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="providerType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Proveedor *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="plumbing">Fontanería</SelectItem>
                            <SelectItem value="electricity">Electricidad</SelectItem>
                            <SelectItem value="analysis">Análisis</SelectItem>
                            <SelectItem value="masonry">Albañilería</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Proveedor Activo</FormLabel>
                        <FormDescription>
                          Marca si el proveedor está actualmente en servicio
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>Datos de contacto del proveedor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona de Contacto *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Juan García" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono Principal *</FormLabel>
                        <FormControl>
                          <div className="md:flex md:items-center md:space-x-2 space-y-2">
                            <Input placeholder="Ej: 600123456" {...field} />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const phoneValue = form.getValues('contactPhone')
                                if (phoneValue) {
                                  form.setValue('secondaryPhone', phoneValue)
                                  form.setValue('emergencyPhone', phoneValue)
                                  toast.success('Teléfono copiado a secundario y emergencias')
                                }
                              }}
                            >
                              Usar en todos los teléfonos
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription></FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Contacto</FormLabel>
                        <FormControl>
                          <div className="md:flex md:items-center md:space-x-2 space-y-2">
                            <Input type="email" placeholder="Ej: contacto@empresa.com" {...field} />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const emailValue = form.getValues('contactEmail')
                                if (emailValue) {
                                  form.setValue('billingEmail', emailValue)
                                  toast.success('Email copiado a facturación')
                                }
                              }}
                            >
                              Usar mismo email para facturación
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondaryPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono Secundario</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 600654321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="billingEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de Facturación</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Ej: facturacion@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Dirección */}
            <Card>
              <CardHeader>
                <CardTitle>Dirección</CardTitle>
                <CardDescription>Ubicación del proveedor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Calle Mayor 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Madrid" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Postal</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 28001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Madrid" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Detalles Operativos */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles Operativos</CardTitle>
                <CardDescription>Información sobre horarios y disponibilidad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="businessHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horario de Atención</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Lunes a Viernes 9:00 - 18:00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Disponible para Emergencias</FormLabel>
                        <FormDescription>
                          Marca si el proveedor está disponible 24/7 para emergencias
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Emergencias</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 600999888" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Información Administrativa */}
            <Card>
              <CardHeader>
                <CardTitle>Información Administrativa</CardTitle>
                <CardDescription>Datos bancarios y de pago</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="bankAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuenta Bancaria (IBAN)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: ES12 1234 5678 9012 3456 7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condiciones de Pago</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 30 días" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitio Web</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="Ej: https://www.empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Notas */}
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
                <CardDescription>Información adicional</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Información adicional sobre el proveedor..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" asChild disabled={isSubmitting}>
                <Link href="/provider">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Guardando...' : 'Guardar Proveedor'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </PageContainer>
  )
}
