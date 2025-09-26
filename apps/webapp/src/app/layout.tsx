import { Inter } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { getPreference } from '@/server/server-actions'
import { PreferencesStoreProvider } from '@/stores/preferences/preferences-provider'
import {
  THEME_MODE_VALUES,
  THEME_PRESET_VALUES,
  type ThemeMode,
  type ThemePreset
} from '@/types/preferences/theme'
import '../styles/globals.css'
import { APP_METADATA } from '../data/metadata'
import { TRPCReactProvider } from '../trpc/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = APP_METADATA

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
          <TRPCReactProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
          </TRPCReactProvider>
          <Toaster />
        </PreferencesStoreProvider>
      </body>
    </html>
  )
}
