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
    return redirect('/unauthorized')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo punto de agua</h1>
        <p className="text-muted-foreground">
          Alta de punto de agua, titular y contador en un solo paso
        </p>
      </div>
      <WaterPointOnboardingForm />
    </div>
  )
}
