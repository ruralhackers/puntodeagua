export const providerTypeLabels: Record<string, string> = {
  plumbing: 'Fontanería',
  electricity: 'Electricidad',
  analysis: 'Análisis',
  masonry: 'Albañilería'
}

export const getProviderTypeLabel = (type: string): string => {
  return providerTypeLabels[type] || type
}
