'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type ProviderSchema, providerSchema } from 'features/providers/schemas/provider.schema'
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
import { Input } from '@/components/ui/input'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { EditProviderCmd } from '@/src/features/providers/application/edit-provider.cmd'

const editSchema = providerSchema

export const EditProviderPage: NextPage<{ provider: ProviderSchema }> = ({ provider }) => {
  const router = useRouter()
  const editProvider = useUseCase(EditProviderCmd)

  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: provider
  })

  async function onSubmit(values: z.infer<typeof editSchema>) {
    await editProvider.execute(values)
    router.push('/dashboard/proveedores')
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
          <h1 className="text-2xl font-bold text-gray-900">Editar Proveedor</h1>
          <p className="text-gray-600">Actualiza los datos del proveedor</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => <input type="hidden" value={field.value} readOnly />}
              />
              <FormField
                control={form.control}
                name="communityId"
                render={({ field }) => <input type="hidden" value={field.value} readOnly />}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input type="text" required placeholder="Nombre del proveedor" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Teléfono" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <textarea rows={4} placeholder="Descripción" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button className="flex-1" type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button className="flex-1" variant="default" type="submit">
              Guardar cambios
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
