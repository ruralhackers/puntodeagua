'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { DateTime } from 'core'
import type { WaterZoneDto } from 'features'
import { createAnalysisSchema } from 'features'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Form } from '@/components/ui/form'
import { PageHeader } from '@/src/components/shared-data/page-header'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { CreateAnalysisCmd } from '@/src/features/analysis/application/create-analysis.cmd'
import { AnalysisForm } from '@/src/features/analysis/delivery/analysis-form'
import { useAuth } from '../../auth/context/auth-context'

export const CreateAnalysisPage: NextPage<{ waterZones: WaterZoneDto[] }> = ({ waterZones }) => {
  const { user } = useAuth()
  const router = useRouter()
  const createAnalysisCommand = useUseCase(CreateAnalysisCmd)

  const form = useForm<z.infer<typeof createAnalysisSchema>>({
    resolver: zodResolver(createAnalysisSchema),
    defaultValues: {
      description: '',
      waterZoneId: '',
      analysisType: '',
      analyst: '',
      analyzedAt: DateTime.fromNow().toISO(),
      ph: '',
      turbidity: '',
      chlorine: '',
      communityId: user?.communityId ?? ''
    }
  })

  async function onSubmit(values: z.infer<typeof createAnalysisSchema>) {
    await createAnalysisCommand.execute(values)
    router.push('/dashboard/registros/analiticas')
  }

  return (
    <div className="px-3 py-4 pb-20">
      <PageHeader title="Nueva analítica" subtitle="Reporta una nueva análisis o problema" />

      <Form {...form}>
        <AnalysisForm
          form={form}
          waterZones={waterZones}
          onSubmit={onSubmit}
          onCancel={() => router.back()}
        />
      </Form>
    </div>
  )
}
