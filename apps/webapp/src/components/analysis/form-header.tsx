'use client'

import { useRouter } from 'next/navigation'
import type * as React from 'react'
import { Button } from '@/components/ui/button'

interface FormHeaderProps {
  title?: string
  subtitle?: string
  onBack?: () => void
  className?: string
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  title = 'Nuevo análisis',
  subtitle = 'Reporta un nuevo análisis o problema',
  onBack,
  className = ''
}) => {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) return onBack()
    router.back()
  }

  return (
    <div className={`flex items-center gap-4 mb-6 ${className}`}>
      <Button
        aria-label="Volver"
        onClick={() => router.back()}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg
          aria-hidden="true"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{subtitle}</p>
      </div>
    </div>
  )
}
