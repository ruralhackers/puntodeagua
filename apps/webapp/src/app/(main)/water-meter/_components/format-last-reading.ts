export function formatLastReading(date: Date | null): string {
  if (!date) {
    return 'Sin lecturas'
  }

  const daysAgo = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))

  if (daysAgo === 0) {
    return 'Hoy'
  }
  if (daysAgo === 1) {
    return 'Ayer'
  }
  return `Hace ${daysAgo} días`
}
