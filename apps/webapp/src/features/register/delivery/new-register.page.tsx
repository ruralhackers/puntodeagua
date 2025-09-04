'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type FC } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const registerFormSchema = z
  .object({
    registerType: z.string().min(1, 'Por favor selecciona un tipo de registro'),
    analyticsSubtype: z.string().optional()
  })
  .refine(
    (data) => {
      if (data.registerType === 'analytics' && !data.analyticsSubtype) {
        return false
      }
      return true
    },
    {
      message: 'Por favor selecciona un subtipo de analítica',
      path: ['analyticsSubtype']
    }
  )

type RegisterFormValues = z.infer<typeof registerFormSchema>

export const NewRegisterPage: FC = () => {
  const router = useRouter()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      registerType: '',
      analyticsSubtype: ''
    }
  })

  const registerType = form.watch('registerType')

  const typesOfRegister = [
    { value: 'analytics', label: 'Analítica' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'counter', label: 'Lectura de contadores' },
    { value: 'issue', label: 'Incidencias' }
  ]

  const analyticsSubtypes = [
    { value: 'chlorine-ph', label: 'Cloro y pH (por usuario)' },
    { value: 'turbidity', label: 'Turbidez (por usuario)' },
    { value: 'hardness', label: 'Dureza (por laboratorio)' },
    { value: 'complete', label: 'Completa (por laboratorio)' }
  ]

  const onSubmit = (values: RegisterFormValues) => {
    if (values.registerType === 'analytics' && values.analyticsSubtype) {
      router.push(`/dashboard/nuevo-registro/analitica/${values.analyticsSubtype}`)
    } else if (values.registerType === 'maintenance') {
      router.push('/dashboard/nuevo-registro/mantenimiento')
    } else if (values.registerType === 'counter') {
      router.push('/dashboard/nuevo-registro/contador')
    } else if (values.registerType === 'issue') {
      router.push('/dashboard/nuevo-registro/incidencia')
    }
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Nuevo Registro</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="registerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Registro</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona el tipo de registro" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typesOfRegister.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {registerType === 'analytics' && (
            <FormField
              control={form.control}
              name="analyticsSubtype"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Analítica</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el tipo de analítica" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {analyticsSubtypes.map((subtype) => (
                        <SelectItem key={subtype.value} value={subtype.value}>
                          {subtype.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button type="submit" className="w-full" size="lg">
            Continuar
          </Button>
        </form>
      </Form>
    </div>
  )
}
