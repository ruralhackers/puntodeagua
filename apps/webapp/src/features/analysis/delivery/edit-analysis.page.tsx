'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { AnalysisDto } from 'features'
import { Analysis } from 'features/registers/entities/analysis'
import { analysisSchema } from 'features/registers/schemas/analysis.schema'
import { AnalysisType } from 'features/registers/value-objects/analysis-type'
import { useRouter } from 'next/navigation'
import { type FC, useId, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { EditAnalysisCmd } from '../application/edit-analysis.cmd'
// import { useUseCase } from '@/<src/core/use-cases/use-use-case'

export const EditAnalysisPage: FC<{ analysis: AnalysisDto }> = ({ analysis }) => {
  const router = useRouter()

  const editAnalysisCommand = useUseCase(EditAnalysisCmd)

  const form = useForm<z.infer<typeof analysisSchema>>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      ...analysis
    }
  })

  // const selectedType = form.watch('analysisType')
  // const analysisTypeId = useId()
  // const analysisParams = useMemo(() => {
  //   if (!selectedType || !AnalysisType.isValidType(selectedType)) return []
  //   return AnalysisType.create(selectedType).getFieldsByType()
  // }, [selectedType])

  async function onSubmit(values: z.infer<typeof editAnalysisCommand>) {
    const analysis = Analysis.fromDto(values)
    await editAnalysisCommand.execute(analysis.toDto())
    router.push('/')
  }

  function onChangeAnalysisType(value: string) {
    form.setValue('analysisType', value, { shouldValidate: true })
  }

  return (
    <div className="px-3 py-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Análisis</h1>
          <p className="text-gray-600">Reporta una nueva análisis o problema</p>
        </div>
      </div>
    </div>
  )
}
