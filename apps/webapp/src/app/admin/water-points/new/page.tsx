import { generatePageTitle } from '@/lib/utils'
import WaterPointOnboardingForm from './_components/water-point-onboarding-form'

export const metadata = {
  title: generatePageTitle('Nuevo enganche')
}

export default function NewWaterPointPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo enganche</h1>
        <p className="text-muted-foreground">
          Alta de punto de agua, titular y contador en un solo paso
        </p>
      </div>
      <WaterPointOnboardingForm />
    </div>
  )
}
