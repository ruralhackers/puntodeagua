'use client'

import { Moon, Sun } from 'lucide-react'

import { updateThemeMode } from '@/lib/theme-utils'
import { setValueToCookie } from '@/server/server-actions'
import { usePreferencesStore } from '@/stores/preferences/preferences-provider'

export function ThemeSwitcher() {
  const themeMode = usePreferencesStore((s) => s.themeMode)
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode)

  const handleValueChange = async () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark'
    updateThemeMode(newTheme)
    setThemeMode(newTheme)
    await setValueToCookie('theme_mode', newTheme)
  }

  return (
    <button
      type="button"
      onClick={handleValueChange}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 hover:bg-white/30 transition-colors"
    >
      {themeMode === 'dark' ? (
        <Sun className="h-5 w-5 text-slate-700" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}
    </button>
  )
}
