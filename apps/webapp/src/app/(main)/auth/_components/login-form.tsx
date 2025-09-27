'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import { Input } from '@/components/ui/input'

const MagicLinkSchema = z.object({
  email: z.string().email({ message: 'Por favor ingresa una dirección de correo válida.' })
})

const CredentialsSchema = z.object({
  email: z.string().email({ message: 'Por favor ingresa una dirección de correo válida.' }),
  password: z.string().min(1, { message: 'La contraseña es requerida.' })
})

type LoginMethod = 'magic-link' | 'credentials'

export function LoginForm() {
  const router = useRouter()
  const emailId = useId()
  const passwordId = useId()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('credentials')

  const schema = loginMethod === 'magic-link' ? MagicLinkSchema : CredentialsSchema

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      ...(loginMethod === 'credentials' && { password: '' })
    }
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setIsLoading(true)
    try {
      if (loginMethod === 'magic-link') {
        const result = await signIn('email', {
          email: data.email,
          redirect: false
        })

        if (result?.error) {
          toast.error('Error enviando el enlace mágico', {
            description: 'Por favor verifica tu correo electrónico e intenta de nuevo.'
          })
        } else {
          setEmailSent(true)
          setSentEmail(data.email)
        }
      } else {
        const result = await signIn('credentials', {
          email: data.email,
          password: (data as z.infer<typeof CredentialsSchema>).password,
          redirect: false
        })

        if (result?.error || result?.ok === false) {
          toast.error('Credenciales inválidas', {
            description: 'Por favor verifica tu correo y contraseña e intenta de nuevo.'
          })
        } else {
          toast.success('Sesión iniciada exitosamente')
          router.push('/')
        }
      }
    } catch {
      toast.error('Ocurrió un error', {
        description: 'Por favor intenta de nuevo más tarde.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMethodChange = (method: LoginMethod) => {
    setLoginMethod(method)
    form.reset()
  }

  // Show email verification message if email was sent successfully
  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Revisa tu correo</h2>
          <p className="text-gray-600">
            Hemos enviado un enlace mágico a{' '}
            <span className="font-medium text-gray-900">{sentEmail}</span>
          </p>
          <p className="text-sm text-gray-500">
            Haz clic en el enlace de tu correo para iniciar sesión en tu cuenta.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setEmailSent(false)
            setSentEmail('')
            form.reset()
          }}
          className="w-full cursor-pointer"
        >
          Usar otro correo
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Login method toggle */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => handleMethodChange('credentials')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            loginMethod === 'credentials'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Correo y Contraseña
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange('magic-link')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            loginMethod === 'magic-link'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Enlace Mágico
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input
                    id={emailId}
                    type="email"
                    placeholder="tu@ejemplo.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {loginMethod === 'credentials' && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      id={passwordId}
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button
            className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading
              ? loginMethod === 'magic-link'
                ? 'Enviando...'
                : 'Iniciando sesión...'
              : loginMethod === 'magic-link'
                ? 'Enviar Enlace Mágico'
                : 'Iniciar Sesión'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
