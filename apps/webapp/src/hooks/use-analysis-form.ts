import { useState } from 'react'
import type { AnalysisType } from '@/constants/analysis-types'

export interface AnalysisFormData {
  analysisType: AnalysisType | ''
  analyst: string
  analyzedAt: string
  communityZoneId: string
  waterDepositId: string
  ph: string
  turbidity: string
  chlorine: string
  description: string
}

export interface AnalysisFormErrors {
  [key: string]: string
}

export function useAnalysisForm() {
  const [formData, setFormData] = useState<AnalysisFormData>({
    analysisType: '',
    analyst: '',
    analyzedAt: new Date().toISOString().split('T')[0],
    communityZoneId: '',
    waterDepositId: '',
    ph: '',
    turbidity: '',
    chlorine: '',
    description: ''
  })

  const [errors, setErrors] = useState<AnalysisFormErrors>({})

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: AnalysisFormErrors = {}

    if (!formData.analysisType) {
      newErrors.analysisType = 'El tipo de análisis es requerido'
    }
    if (!formData.analyst.trim()) {
      newErrors.analyst = 'El nombre del analista es requerido'
    }
    if (!formData.analyzedAt) {
      newErrors.analyzedAt = 'La fecha de análisis es requerida'
    }

    // Conditional validation based on analysis type
    if (formData.analysisType) {
      if (['chlorine_ph', 'hardness', 'complete'].includes(formData.analysisType)) {
        if (!formData.ph || Number.isNaN(Number(formData.ph)) || Number(formData.ph) < 0) {
          newErrors.ph = 'El valor de pH es requerido y debe ser un número mayor o igual a 0'
        }
      }
      if (['chlorine_ph', 'complete'].includes(formData.analysisType)) {
        if (
          !formData.chlorine ||
          Number.isNaN(Number(formData.chlorine)) ||
          Number(formData.chlorine) < 0
        ) {
          newErrors.chlorine =
            'El valor de cloro es requerido y debe ser un número mayor o igual a 0'
        }
      }
      if (['turbidity', 'complete'].includes(formData.analysisType)) {
        if (
          !formData.turbidity ||
          Number.isNaN(Number(formData.turbidity)) ||
          Number(formData.turbidity) < 0
        ) {
          newErrors.turbidity =
            'El valor de turbidez es requerido y debe ser un número mayor o igual a 0'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData({
      analysisType: '',
      analyst: '',
      analyzedAt: new Date().toISOString().split('T')[0],
      communityZoneId: '',
      waterDepositId: '',
      ph: '',
      turbidity: '',
      chlorine: '',
      description: ''
    })
    setErrors({})
  }

  return {
    formData,
    errors,
    updateFormData,
    validateForm,
    resetForm
  }
}
