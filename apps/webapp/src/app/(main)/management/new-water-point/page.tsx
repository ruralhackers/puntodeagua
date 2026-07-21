import { redirect } from 'next/navigation'
import { canCreateWaterPoint } from '@/lib/user-roles'
import { generatePageTitle } from '@/lib/utils'
import { auth } from '@/server/auth'
import WaterPointOnboardingForm from './_components/water-point-onboarding-form'

export const metadata = {
  title: generatePageTitle('Nuevo punto de agua')
}

export default async function NewWaterPointPage() {
  const session = await auth()

  if (!session?.user) {
    return redirect('/login')
  }

  if (!canCreateWaterPoint(session.user.roles)) {
    return redirect('/')
  }

  return (
    <main className="-m-4 min-h-[calc(100vh-4rem)] bg-linear-to-br from-sky-50 via-white to-emerald-50/60 p-4 md:-m-6 md:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="rounded-2xl border border-sky-100 bg-white/80 px-6 py-7 shadow-sm backdrop-blur-sm md:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
            <span className="size-1.5 rounded-full bg-sky-500" />
            Alta de suministro
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Nuevo punto de agua
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Registra la vivienda, el titular y el contador en un único formulario para dejar el
            punto listo para gestionar lecturas.
          </p>
        </header>

        <WaterPointOnboardingForm />
      </div>
    </main>
  )
}
