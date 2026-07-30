/**
 * Spanish number handling.
 *
 * In Spanish notation the comma is the decimal separator and the dot groups
 * thousands. A raw text input cannot distinguish a user typing "1234.5"
 * (meaning 1234,5) from the thousands form "1.234" — so the ambiguity is
 * removed at the keystroke by normalizeDecimalInput rather than guessed at
 * here. Every input guarded by it holds only digits and at most one comma.
 */

/** Converts a Spanish-formatted number string to a JS number. */
export function parseSpanishNumber(value: string): number {
  if (!value || value.trim() === '') return 0

  const withoutThousands = value.trim().replace(/\./g, '')
  const normalized = withoutThousands.replace(',', '.')
  const parsed = Number.parseFloat(normalized)

  return Number.isNaN(parsed) ? 0 : parsed
}

/** Formats a number for display, grouped: 1234 -> "1.234,00" */
export function formatToSpanish(value: number): string {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Formats a number to seed a text input, ungrouped: 1234 -> "1234,00".
 * Never contains a dot, so normalizeDecimalInput is idempotent over it.
 */
export function formatForInput(value: number): string {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false
  })
}

/**
 * Normalises a reading input as the user types. The first separator typed —
 * dot or comma — becomes the decimal comma; every later separator and any
 * non-digit is dropped. Output is always /^[0-9]*,?[0-9]*$/ and applying this
 * twice changes nothing.
 */
export function normalizeDecimalInput(value: string): string {
  let hasSeparator = false
  let result = ''

  for (const char of value) {
    if (char >= '0' && char <= '9') {
      result += char
    } else if ((char === '.' || char === ',') && !hasSeparator) {
      hasSeparator = true
      result += ','
    }
  }

  return result
}
