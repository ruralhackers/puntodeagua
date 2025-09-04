import { DateTime } from 'core/date-time/date-time'

export function formatDate(date: Date) {
  try {
    return DateTime.fromDate(date).format("d 'de' LLLL 'de' yyyy", { locale: 'es' })
  } catch {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    })
  }
}

export function toTitle(analysisType: string) {
  if (analysisType === 'chlorine_ph') return 'Cloro/pH'
  if (analysisType === 'turbidity') return 'Turbidez'
  if (analysisType === 'hardness') return 'Dureza'
  if (analysisType === 'complete') return 'Completo'
  return analysisType
}
