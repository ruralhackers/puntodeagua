'use client'

import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { canCreateWaterPoint } from '@/lib/user-roles'
import { useUserStore } from '@/stores/user/user-provider'

export function NewWaterPointCard() {
  const user = useUserStore((state) => state.user)

  if (!user || !canCreateWaterPoint(user.roles)) {
    return null
  }

  return (
    <Link href="/management/new-water-point" className="group">
      <Card className="h-32 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:border-teal-300">
        <CardContent className="flex items-center justify-center h-full p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <PlusCircle className="h-8 w-8 text-teal-600 group-hover:scale-110 transition-transform" />
            <div>
              <CardTitle className="text-teal-800 text-sm font-semibold">
                Nuevo punto de agua
              </CardTitle>
              <CardDescription className="text-teal-600 text-xs mt-1">
                Alta de punto, titular y contador
              </CardDescription>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
