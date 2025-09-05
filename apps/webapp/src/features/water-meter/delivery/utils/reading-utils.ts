/**
 * Calcula los días transcurridos desde la última lectura
 * @param lastReadingDate - Fecha de la última lectura
 * @returns Número de días transcurridos, o null si no hay fecha
 */
export function getDaysSinceLastReading(lastReadingDate?: Date): number | null {
  if (!lastReadingDate) {
    return null
  }

  const now = new Date()
  const lastReading = new Date(lastReadingDate)

  // Calcular la diferencia en milisegundos
  const diffInMs = now.getTime() - lastReading.getTime()

  // Convertir a días
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  return diffInDays
}

/**
 * Formatea los días transcurridos en un texto legible
 * @param days - Número de días
 * @returns Texto formateado
 */
export function formatDaysSinceReading(days: number | null): string {
  if (days === null) {
    return 'Sin lecturas'
  }

  if (days === 0) {
    return 'Hoy'
  }

  if (days === 1) {
    return 'Hace 1 día'
  }

  return `Hace ${days} días`
}

/**
 * Obtiene el normalized reading de la última lectura
 * @param readings - Array de lecturas
 * @returns Normalized reading de la última lectura, o null si no hay lecturas
 */
export function getLastNormalizedReading(
  readings?: Array<{
    id: string
    readingDate: Date
    reading: string
    normalizedReading: string
    consumption: number
    'excess-consumption': boolean
  }>
): string | null {
  if (!readings || readings.length === 0) {
    return null
  }

  // Ordenar por fecha descendente y tomar la primera
  const sortedReadings = readings.sort(
    (a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
  )

  return sortedReadings[0]?.normalizedReading || null
}
