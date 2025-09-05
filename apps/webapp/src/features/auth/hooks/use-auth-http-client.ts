import { HttpClient } from 'core'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { ClientTokenProvider } from '../../../core/http/client-token-provider'
import { useAuth } from '../context/auth-context'

export function useAuthHttpClient() {
  const { token, logout } = useAuth()
  const router = useRouter()

  const authenticatedHttpClient = useMemo(() => {
    const tokenProvider = new ClientTokenProvider(
      () => token,
      () => {
        logout()
        router.push('/login')
      }
    )

    return new HttpClient(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
      tokenProvider
    )
  }, [token, logout, router])

  return authenticatedHttpClient
}
