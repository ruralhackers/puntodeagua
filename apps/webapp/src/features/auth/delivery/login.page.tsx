'use client'

import type { FC } from 'react'
import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { webAppContainer } from '../../../core/di/webapp.container'
import { UseCaseService } from 'core'
import { LoginCmd } from '../application/login.cmd'
import { loginSchema, type LoginDto } from '../schemas/auth.schema'
import { z } from 'zod'
import { Input } from '../../../../components/ui/input'
import { Button } from '../../../../components/ui/button'
import { Page } from '../../../core/components/page'

export const LoginPage: FC = () => {
  const router = useRouter()
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
      const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)
      const result = await useCaseService.execute(LoginCmd, dto)
      if (result?.token) {
        localStorage.setItem('auth_token', result.token)
        router.push('/dashboard')
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
