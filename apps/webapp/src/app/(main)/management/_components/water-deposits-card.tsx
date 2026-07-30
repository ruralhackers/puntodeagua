'use client'

import { Droplets } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { canManageWaterDeposits } from '@/lib/user-roles'
import { useUserStore } from '@/stores/user/user-provider'

export function WaterDepositsCard() {
  const user = useUserStore((state) => state.user)

  if (!user || !canManageWaterDeposits(user.roles)) {
    return null
  }

  return (
    <Link href="/management/deposits" className="group">
      <Card className="h-32 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:border-cyan-300">
        <CardContent className="flex items-center justify-center h-full p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Droplets className="h-8 w-8 text-cyan-600 group-hover:scale-110 transition-transform" />
            <div>
              <CardTitle className="text-cyan-800 text-sm font-semibold">
                Depósitos de agua
              </CardTitle>
              <CardDescription className="text-cyan-600 text-xs mt-1">
                Alta y edición de depósitos
              </CardDescription>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
