import Image from 'next/image'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/app/(main)/auth/_components/login-form'
import { APP_CONFIG } from '@/config/app-config'
import { auth } from '@/server/auth'
import { HydrateClient } from '@/trpc/server'

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    redirect('/')
  }

  return (
    <HydrateClient>
      <div className="flex h-dvh">
        <div className="bg-gradient-to-br from-blue-500 via-blue-400 to-blue-200 hidden lg:block lg:w-1/3">
          <div className="flex h-full flex-col items-center justify-center p-12 text-center">
            <div className="space-y-8">
              <div className="flex justify-center">
                <Image
                  src="/favicon/192x192.png"
                  alt="PromptHero Logo"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-2xl shadow-2xl ring-4 ring-white/20"
                />
              </div>
              <div className="space-y-3">
                <h1 className="text-white text-4xl font-light tracking-tight">
                  Bienvenido a {APP_CONFIG.name}
                </h1>
                <p className="text-white/90 text-xl font-medium">
                  Inicia sesión para continuar tu viaje
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-white flex w-full items-center justify-center p-8 lg:w-2/3">
          <div className="w-full max-w-md space-y-10 py-24 lg:py-32">
            <div className="space-y-4 text-center">
              <div className="text-blue-800 text-2xl font-semibold tracking-tight">
                Iniciar sesión
              </div>
              <div className="text-blue-600 mx-auto max-w-xl text-base">
                Bienvenido de nuevo. Ingresa tu correo electrónico para recibir un enlace mágico o
                accede con tu contraseña.
              </div>
            </div>
            <div className="space-y-4 bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  )
}
