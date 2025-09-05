'use client'

import { useRouter } from 'next/navigation'
import type { FC } from 'react'
import { useId, useState } from 'react'
import { z } from 'zod'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Page } from '../../../core/components/page'
import { useUseCase } from '../../../core/use-cases/use-use-case'
import { LoginCmd } from '../application/login.cmd'
import { useAuth } from '../context/auth-context'
import { type LoginDto, loginSchema } from '../schemas/auth.schema'
import { hybridAuth } from '../utils/hybrid-storage'

export const LoginPage: FC = () => {
  const router = useRouter()
  const { login } = useAuth()
  const loginCommand = useUseCase(LoginCmd)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const emailId = useId()
  const passwordId = useId()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const dto: LoginDto = loginSchema.parse({ email, password })
      const result = await loginCommand.execute(dto)

      if (result?.token) {
        login(result)

        const redirectPath = hybridAuth.getRedirect()
        hybridAuth.removeRedirect()

        router.push(redirectPath || '/dashboard')
        return
      }
      setError('Unexpected response')
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message ?? 'Invalid input')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page>
      <div className="min-h-[calc(100vh-4rem)] w-full bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-blue-700">Punto de Agua</h1>
            <p className="mt-2 text-sm text-gray-600">Accede para gestionar tu comunidad</p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
            <div className="border-b border-blue-100 bg-blue-50/60 px-5 py-4 rounded-t-xl">
              <h2 className="text-base font-medium text-blue-800">Iniciar sesión</h2>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4 p-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700" htmlFor={emailId}>
                  Email
                </label>
                <Input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="h-11"
                  placeholder="tucorreo@dominio.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700" htmlFor={passwordId}>
                  Contraseña
                </label>
                <Input
                  id={passwordId}
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="h-11"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="text-sm rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Accediendo…' : 'Acceder'}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Punto de Agua
          </p>
        </div>
      </div>
    </Page>
  )
}
