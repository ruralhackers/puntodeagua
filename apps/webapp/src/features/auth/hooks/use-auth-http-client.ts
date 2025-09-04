import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { useAuth } from '../context/auth-context'
import { AuthHttpClient } from '../infrastructure/auth-http-client'

export function useAuthHttpClient() {
  const { token, logout } = useAuth()
  const router = useRouter()

  const authHttpClient = useMemo(() => {
    return new AuthHttpClient(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
      () => token,
      () => {
        logout()
        router.push('/login')
      }
    )
  }, [token, logout, router])

  return authHttpClient
}
