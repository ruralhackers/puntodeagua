export interface SearchableMeter {
  waterAccountName: string
  waterPoint: {
    name: string
    location: string
    connectionNumber?: string | null
  }
}

/**
 * Filters meters by a free-text query and floats an exact connection-number
 * match to the top. Searching "42" has to surface enganche 42 above 142 and
 * 420, otherwise a one- or two-digit search is useless in practice.
 */
export function filterAndRankMeters<T extends SearchableMeter>(meters: T[], rawQuery: string): T[] {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return meters

  const matches = meters.filter(
    (meter) =>
      meter.waterAccountName.toLowerCase().includes(query) ||
      meter.waterPoint.name.toLowerCase().includes(query) ||
      meter.waterPoint.location.toLowerCase().includes(query) ||
      meter.waterPoint.connectionNumber?.toLowerCase().includes(query)
  )

  const isExactConnectionNumber = (meter: T) =>
    meter.waterPoint.connectionNumber?.trim().toLowerCase() === query

  // Stable: Array.prototype.sort is stable, so non-exact matches keep the
  // order the query returned them in (oldest reading first).
  return [...matches].sort(
    (a, b) => Number(isExactConnectionNumber(b)) - Number(isExactConnectionNumber(a))
  )
}
