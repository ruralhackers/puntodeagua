import Image from 'next/image'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/app/(main)/auth/_components/login-form'
import { APP_CONFIG } from '@/config/app-config'
import { auth } from '@/server/auth'
import { HydrateClient } from '@/trpc/server'

export default async function Home() {
  const session = await auth()

  // Redirect to dashboard if user is already authenticated
  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <HydrateClient>
      <div className="flex h-dvh">
        <div className="bg-gradient-to-br from-rose-600 via-pink-600 to-red-600 hidden lg:block lg:w-1/3">
          <div className="flex h-full flex-col items-center justify-center p-12 text-center">
            <div className="space-y-8">
              <div className="flex justify-center">
                <Image
                  src="/logo-96x96.png"
                  alt="PromptHero Logo"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-2xl shadow-2xl ring-4 ring-white/20"
                />
              </div>
              <div className="space-y-3">
                <h1 className="text-white text-4xl font-light tracking-tight">
                  Welcome to {APP_CONFIG.name}
                </h1>
                <p className="text-white/90 text-xl font-medium">Login to continue your journey</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-gray-100 flex w-full items-center justify-center p-8 lg:w-2/3">
          <div className="w-full max-w-md space-y-10 py-24 lg:py-32">
            <div className="space-y-4 text-center">
              <div className="text-gray-900 text-2xl font-semibold tracking-tight">Login</div>
              <div className="text-gray-600 mx-auto max-w-xl text-base">
                Welcome back. Enter your email to receive a magic link.
              </div>
            </div>
            <div className="space-y-4 bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  )
}
