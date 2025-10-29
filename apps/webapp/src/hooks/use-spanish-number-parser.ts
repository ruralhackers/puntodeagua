export function useSpanishNumberParser() {
  /**
   * Converts Spanish number format to standard number format
   * Examples: "1.234,56" → 1234.56, "1234,56" → 1234.56
   */
  const parseSpanishNumber = (value: string): number => {
    if (!value || value.trim() === '') return 0

    // Remove spaces
    const cleaned = value.trim()
    // Remove dots (thousands separators)
    const withoutThousands = cleaned.replace(/\./g, '')
    // Replace comma with dot (decimal separator)
    const normalized = withoutThousands.replace(',', '.')

    const parsed = parseFloat(normalized)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  /**
   * Converts number to Spanish format (for display purposes)
   * Example: 1234.56 → "1.234,56"
   */
  const formatToSpanish = (value: number): string => {
    return value.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  return { parseSpanishNumber, formatToSpanish }
}
