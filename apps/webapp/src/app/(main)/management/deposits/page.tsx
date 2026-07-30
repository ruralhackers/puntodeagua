import { redirect } from 'next/navigation'
import { canManageWaterDeposits } from '@/lib/user-roles'
import { generatePageTitle } from '@/lib/utils'
import { auth } from '@/server/auth'
import { DepositList } from './_components/deposit-list'

export const metadata = {
  title: generatePageTitle('Depósitos de agua')
}

export default async function WaterDepositsPage() {
  const session = await auth()

  if (!session?.user) {
    return redirect('/login')
  }

  if (!canManageWaterDeposits(session.user.roles)) {
    return redirect('/')
  }

  return (
    <main className="flex-1 px-3 py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Depósitos de agua</h1>
        <p className="text-muted-foreground">
          Da de alta y edita los depósitos de tu comunidad. Se usan al registrar puntos de agua,
          análisis e incidencias.
        </p>
      </div>

      <DepositList />
    </main>
  )
}
