'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { AnalysisDto, WaterZoneDto } from 'features'
import { Analysis } from 'features/registers/entities/analysis'
import { analysisSchema } from 'features/registers/schemas/analysis.schema'
import { useRouter } from 'next/navigation'
import type { FC } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Form } from '@/components/ui/form'
import { PageHeader } from '@/src/components/shared-data/page-header'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { AnalysisForm } from '@/src/features/analysis/delivery/analysis-form'
import { EditAnalysisCmd } from '../application/edit-analysis.cmd'

export const EditAnalysisPage: FC<{ analysis: AnalysisDto; waterZone: WaterZoneDto }> = ({
  analysis,
  waterZone
}) => {
  const router = useRouter()
  const editAnalysisCommand = useUseCase(EditAnalysisCmd)

  const form = useForm<z.infer<typeof analysisSchema>>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      ...analysis,
      analyzedAt: analysis.analyzedAt
    }
  })

  async function onSubmit(values: z.infer<typeof analysisSchema>) {
    const analysisEntity = Analysis.fromDto(values)
    await editAnalysisCommand.execute(analysisEntity.toDto())
    router.push(`/dashboard/registros/analiticas/${values.id}`)
  }

  return (
    <div className="px-3 py-4 pb-20">
      <PageHeader title="Editar análisis" subtitle="Actualiza los datos del análisis" />
      <Form {...form}>
        <AnalysisForm
          form={form}
          waterZones={[waterZone]}
          onSubmit={onSubmit}
          onCancel={() => router.back()}
          isEdit={true}
          waterZone={waterZone}
        />
      </Form>
    </div>
  )
}
