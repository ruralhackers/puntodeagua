import {
  formatForInput,
  formatToSpanish,
  normalizeDecimalInput,
  parseSpanishNumber
} from '@/lib/spanish-number'

/**
 * Thin wrapper over `@/lib/spanish-number` so existing components keep their
 * call sites. Prefer importing from the lib directly in new code — the
 * functions are pure and need no hook.
 */
export function useSpanishNumberParser() {
  return { parseSpanishNumber, formatToSpanish, formatForInput, normalizeDecimalInput }
}
