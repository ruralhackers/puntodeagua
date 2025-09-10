import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { APP_CONFIG } from '@/config/app-config'
import { getPreference } from '@/server/server-actions'
import { PreferencesStoreProvider } from '@/stores/preferences/preferences-provider'
import {
  THEME_MODE_VALUES,
  THEME_PRESET_VALUES,
  type ThemeMode,
  type ThemePreset
} from '@/types/preferences/theme'
import '../styles/globals.css'
import { TRPCReactProvider } from '../trpc/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const themeMode = await getPreference<ThemeMode>('theme_mode', THEME_MODE_VALUES, 'light')
  const themePreset = await getPreference<ThemePreset>(
    'theme_preset',
    THEME_PRESET_VALUES,
    'default'
  )

  return (
    <html
      lang="en"
      className={themeMode === 'dark' ? 'dark' : ''}
      data-theme-preset={themePreset}
      suppressHydrationWarning
    >
      <body className={`${inter.className} min-h-screen antialiased`}>
        <PreferencesStoreProvider themeMode={themeMode} themePreset={themePreset}>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster />
        </PreferencesStoreProvider>
      </body>
    </html>
  )
}
