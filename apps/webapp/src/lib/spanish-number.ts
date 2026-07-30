/**
 * Spanish number handling for meter readings.
 *
 * In Spanish notation the comma is the decimal separator and the dot groups
 * thousands — but people typing on a phone keypad routinely use the dot as a
 * decimal point too. Both intentions are real and both reach these inputs:
 *
 *   "12.345"  a Spanish grouped integer     -> 12345
 *   "1234.5"  a keypad decimal              -> 1234.5
 *
 * Neither can be honoured by a fixed rule, so parseSpanishNumber disambiguates
 * the way every locale-aware parser does: a dot followed by exactly three
 * digits groups thousands, anything else is a decimal point. That is a
 * heuristic, but it is right for every shape a meter reading actually takes,
 * and it is applied at parse time rather than as the user types — normalising
 * mid-keystroke would commit to an interpretation before the number is
 * finished (after "12.3" you cannot yet know whether "12.345" is coming).
 */

/** True when the dot at `index` groups thousands rather than marking decimals. */
function isThousandsSeparator(value: string, index: number): boolean {
  const digitsAfter = value.length - index - 1
  return digitsAfter === 3 && index > 0
}

/** Converts a Spanish-formatted number string to a JS number. */
export function parseSpanishNumber(value: string): number {
  if (!value || value.trim() === '') return 0

  const trimmed = value.trim()

  // A comma is unambiguous: it is the decimal separator, dots group thousands.
  if (trimmed.includes(',')) {
    return toNumber(trimmed.replace(/\./g, '').replace(',', '.'))
  }

  const lastDot = trimmed.lastIndexOf('.')
  if (lastDot === -1) return toNumber(trimmed)

  if (isThousandsSeparator(trimmed, lastDot)) {
    return toNumber(trimmed.replace(/\./g, ''))
  }

  // The last dot is a decimal point; any earlier dot still groups thousands.
  const head = trimmed.slice(0, lastDot).replace(/\./g, '')
  return toNumber(`${head}.${trimmed.slice(lastDot + 1)}`)
}

function toNumber(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * Formats a number for display, grouped: 12345 -> "12.345,00".
 * Three decimals because the reading column is Decimal(10, 3).
 */
export function formatToSpanish(value: number): string {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  })
}

/**
 * Formats a number to seed a text input, ungrouped: 12345 -> "12345,00".
 *
 * Ungrouped so the seeded value cannot itself be re-read as a grouped number,
 * and to three decimals because the reading column is Decimal(10, 3): at two,
 * opening the edit modal to change only a note would silently round the stored
 * reading.
 */
export function formatForInput(value: number): string {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
    useGrouping: false
  })
}

/**
 * Filters a reading input as the user types: keeps digits, dots and at most
 * one comma, and drops everything else. It deliberately does NOT rewrite the
 * separator — interpreting it is parseSpanishNumber's job, once the number is
 * complete.
 */
export function normalizeDecimalInput(value: string): string {
  let hasComma = false
  let result = ''

  for (const char of value) {
    if ((char >= '0' && char <= '9') || char === '.') {
      result += char
    } else if (char === ',' && !hasComma) {
      hasComma = true
      result += char
    }
  }

  return result
}
