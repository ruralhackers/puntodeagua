'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { idSchema } from 'core'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import { useAuth } from '@/src/features/auth/context/auth-context'
import { CreateProviderCmd } from '@/src/features/providers/application/create-provider.cmd'

const createProviderSchema = z.object({
  communityId: idSchema,
  name: z.string().min(1, 'Nombre requerido'),
  phone: z.string().optional(),
  description: z.string().optional()
})

export const CreateProviderPage: NextPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  console.log('user', user)
  const createProvider = useUseCase(CreateProviderCmd)

  const defaultCommunityId = user?.communityId ?? ''

  const form = useForm<z.infer<typeof createProviderSchema>>({
    resolver: zodResolver(createProviderSchema),
    defaultValues: {
      communityId: defaultCommunityId,
      name: '',
      phone: '',
      description: ''
    }
  })

  // Ensure communityId is set from authenticated user once available
  useEffect(() => {
    if (user?.communityId) {
      form.setValue('communityId', user.communityId, { shouldValidate: true })
    }
  }, [user?.communityId, form])

  async function onSubmit(values: z.infer<typeof createProviderSchema>) {
    console.log('values', values)
    await createProvider.execute(values)
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
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Proveedor</h1>
          <p className="text-gray-600">Crea un proveedor para la comunidad</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Hidden field to keep communityId registered in the form */}
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
            <Button
              className="flex-1"
              variant="default"
              type="submit"
              disabled={!form.getValues('communityId')}
            >
              Crear Proveedor
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
