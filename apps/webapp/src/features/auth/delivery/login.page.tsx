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
        login(result) // Use AuthContext login function

        // Check for redirect path
        const redirectPath = localStorage.getItem('auth_redirect')
        localStorage.removeItem('auth_redirect')

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
      <div className="flex h-full w-full items-center justify-center">
        <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4 p-4">
          <h1 className="text-2xl font-semibold">Login</h1>
          <div className="flex flex-col gap-2">
            <label className="text-sm" htmlFor={emailId}>
              Email
            </label>
            <Input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm" htmlFor={passwordId}>
              Password
            </label>
            <Input
              id={passwordId}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </Page>
  )
}
