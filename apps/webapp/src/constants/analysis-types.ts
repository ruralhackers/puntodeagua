// export type AnalysisType = 'chlorine_ph' | 'turbidity' | 'hardness' | 'complete'

import type { AnalysisType } from '@pda/registers/domain'

export const ANALYSIS_TYPE_OPTIONS: {
  value: AnalysisType
  label: string
  description: string
  icon: string
}[] = [
  {
    value: 'chlorine_ph',
    label: 'Cloro y pH',
    description: 'Medición de cloro residual y nivel de pH',
    icon: '🧪'
  },
  {
    value: 'turbidity',
    label: 'Turbidez',
    description: 'Medición de la claridad del agua',
    icon: '💧'
  },
  {
    value: 'hardness',
    label: 'Dureza',
    description: 'Medición del contenido de minerales',
    icon: '⚗️'
  },
  {
    value: 'complete',
    label: 'Análisis Completo',
    description: 'Todas las mediciones disponibles',
    icon: '🔬'
  }
]

// Validation rules for each analysis type
export const ANALYSIS_TYPE_REQUIREMENTS = {
  chlorine_ph: ['ph', 'chlorine'],
  turbidity: ['turbidity'],
  hardness: ['ph'],
  complete: ['ph', 'chlorine', 'turbidity']
} as const
