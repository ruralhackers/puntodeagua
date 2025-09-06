'use client'

import { FileText, Home, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { FC } from 'react'
import { useTabBar } from '@/components/navigation/tab-bar-context'
import { cn } from '@/lib/utils'

export const TabBar: FC = () => {
  const pathname = usePathname()
  const { isTabBarVisible } = useTabBar()

  if (!isTabBarVisible) {
    return null
  }

  const tabs = [
    {
      href: '/',
      label: 'Inicio',
      icon: Home,
      active: pathname === '/'
    },
    {
      href: '/dashboard/registros',
      label: 'Registros',
      icon: FileText,
      active: pathname.includes('/dashboard/registros')
    },
    {
      href: '/dashboard/mas',
      label: 'Más',
      icon: Menu,
      active: pathname.includes('/dashboard/mas')
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden pb-2">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full text-xs',
                tab.active ? 'text-blue-600' : 'text-gray-500'
              )}
            >
              {tab.icon && <tab.icon className="h-6 w-6 mb-1 stroke-[1.5px]" />}
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
