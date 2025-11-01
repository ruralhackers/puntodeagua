// --- generated:themePresets:start ---

export const THEME_PRESET_OPTIONS = [
  {
    label: 'Default',
    value: 'default',
    primary: 'oklch(0.205 0 0)'
  },
  {
    label: 'Brutalist',
    value: 'brutalist',
    primary: 'oklch(0.6489 0.2370 26.9728)'
  },
  {
    label: 'Soft Pop',
    value: 'soft-pop',
    primary: 'oklch(0.5106 0.2301 276.9656)'
  },
  {
    label: 'Tangerine',
    value: 'tangerine',
    primary: 'oklch(0.64 0.17 36.44)'
  }
] as const

export const THEME_PRESET_VALUES = THEME_PRESET_OPTIONS.map((p) => p.value)

export type ThemePreset = (typeof THEME_PRESET_OPTIONS)[number]['value']

// --- generated:themePresets:end ---
