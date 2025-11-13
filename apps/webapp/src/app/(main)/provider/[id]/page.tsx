'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { providerUpdateSchema } from '@pda/providers/domain/entities/provider.dto'
import {
  ArrowLeft,
  Building2,
  Edit,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import PageContainer from '@/components/layout/page-container'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/trpc/react'
import ProviderTypeBadge from '../_components/provider-type-badge'

type FormData = z.infer<typeof providerUpdateSchema>

export default function ProviderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const providerId = params.id as string
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const {
    data: provider,
    isLoading,
    error,
    refetch
  } = api.providers.getProviderById.useQuery({ id: providerId }, { enabled: !!providerId })

  const form = useForm<FormData>({
    resolver: zodResolver(providerUpdateSchema),
    values: provider
      ? {
          companyName: provider.companyName,
          taxId: provider.taxId || '',
          contactPerson: provider.contactPerson,
          contactPhone: provider.contactPhone,
          contactEmail: provider.contactEmail || '',
          secondaryPhone: provider.secondaryPhone || '',
          billingEmail: provider.billingEmail || '',
          address: provider.address || '',
          city: provider.city || '',
          postalCode: provider.postalCode || '',
          province: provider.province || '',
          providerType: provider.providerType,
          isActive: provider.isActive,
          notes: provider.notes || '',
          businessHours: provider.businessHours || '',
          emergencyAvailable: provider.emergencyAvailable,
          emergencyPhone: provider.emergencyPhone || '',
          bankAccount: provider.bankAccount || '',
          paymentTerms: provider.paymentTerms || '',
          website: provider.website || '',
          communityId: provider.communityId
        }
      : undefined
  })

  const updateProviderMutation = api.providers.updateProvider.useMutation({
    onSuccess: () => {
      toast.success('Proveedor actualizado')
      refetch()
      setIsEditing(false)
      setIsSubmitting(false)
    },
    onError: (error) => {
      toast.error(error.message || 'No se pudo actualizar el proveedor.')
      setIsSubmitting(false)
    }
  })

  const deleteProviderMutation = api.providers.deleteProvider.useMutation({
    onSuccess: () => {
      toast.success('Proveedor eliminado')
      router.push('/provider')
    },
    onError: (error) => {
      toast.error(error.message || 'No se pudo eliminar el proveedor.')
      setIsSubmitting(false)
    }
  })

  const onSubmit = async (data: FormData) => {
    if (!provider) return
    setIsSubmitting(true)
    updateProviderMutation.mutate({
      id: provider.id,
      ...data
    })
  }

  const handleDelete = () => {
    if (!provider) return
    deleteProviderMutation.mutate({ id: provider.id })
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando proveedor...</div>
        </div>
      </PageContainer>
    )
  }

  if (error || !provider) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          {error ? `Error al cargar el proveedor: ${error.message}` : 'Proveedor no encontrado'}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <Link href="/provider">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Proveedores
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {provider.companyName}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <ProviderTypeBadge providerType={provider.providerType} />
                <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                  {provider.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>

            {!isEditing && (
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button onClick={() => setShowDeleteDialog(true)} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* View Mode */}
        {!isEditing && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Persona de Contacto
                      </p>
                      <p className="text-base">{provider.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Teléfono Principal
                      </p>
                      <p className="text-base">{provider.contactPhone}</p>
                    </div>
                  </div>

                  {provider.contactEmail && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email de Contacto</p>
                      <p className="text-base">{provider.contactEmail}</p>
                    </div>
                  )}

                  {provider.secondaryPhone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Teléfono Secundario
                      </p>
                      <p className="text-base">{provider.secondaryPhone}</p>
                    </div>
                  )}

                  {provider.billingEmail && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Email de Facturación
                      </p>
                      <p className="text-base">{provider.billingEmail}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address */}
              {(provider.address || provider.city || provider.postalCode || provider.province) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Dirección
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {provider.address && <p>{provider.address}</p>}
                    {(provider.city || provider.postalCode || provider.province) && (
                      <p className="text-muted-foreground">
                        {[provider.city, provider.postalCode, provider.province]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {provider.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Notas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{provider.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                    <p className="text-base">{provider.companyName}</p>
                  </div>

                  {provider.taxId && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">CIF/NIF</p>
                      <p className="text-base">{provider.taxId}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                    <div className="mt-1">
                      <ProviderTypeBadge providerType={provider.providerType} />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <Badge variant={provider.isActive ? 'default' : 'secondary'} className="mt-1">
                      {provider.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Operational Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles Operativos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {provider.businessHours && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Horario</p>
                      <p className="text-base">{provider.businessHours}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emergencias</p>
                    <Badge
                      variant={provider.emergencyAvailable ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {provider.emergencyAvailable ? 'Disponible 24/7' : 'No disponible'}
                    </Badge>
                  </div>

                  {provider.emergencyPhone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Teléfono de Emergencias
                      </p>
                      <p className="text-base">{provider.emergencyPhone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Administrative */}
              {(provider.bankAccount || provider.paymentTerms || provider.website) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Información Administrativa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {provider.bankAccount && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Cuenta Bancaria</p>
                        <p className="text-base font-mono text-sm">{provider.bankAccount}</p>
                      </div>
                    )}

                    {provider.paymentTerms && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Condiciones de Pago
                        </p>
                        <p className="text-base">{provider.paymentTerms}</p>
                      </div>
                    )}

                    {provider.website && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Sitio Web</p>
                        <a
                          href={provider.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Globe className="h-4 w-4" />
                          {provider.website}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
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
                            <Input {...field} />
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
                            <Input {...field} />
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
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
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
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
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
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
                            <Input type="email" {...field} />
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
                            <Input {...field} />
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
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Dirección</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Operational Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles Operativos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horario de Atención</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Administrative */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Administrativa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bankAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuenta Bancaria (IBAN)</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input type="url" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-[100px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El proveedor será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
