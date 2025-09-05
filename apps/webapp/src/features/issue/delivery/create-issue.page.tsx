'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { DateTime } from 'core'
import { createIssueSchema, type WaterZoneDto } from 'features'
import type { CreateIssueSchema } from 'features/issues/schemas/create-issue.schema'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { CreateIssueCmd } from '@/src/features/issue/application/create-issue.cmd'
import { IssueForm } from '@/src/features/issue/delivery/issue-form'

interface CreateIssuePageProps {
  waterZones: WaterZoneDto[]
}

export const CreateIssuePage: NextPage<CreateIssuePageProps> = ({ waterZones }) => {
  const router = useRouter()
  const createIssueCommand = useUseCase(CreateIssueCmd)

  const form = useForm<CreateIssueSchema>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: '',
      waterZoneId: '',
      description: '',
      startAt: DateTime.fromNow().toISO(),
      reporterName: '',
      status: 'open',
      endAt: ''
    }
  })

  async function onSubmit(values: CreateIssueSchema) {
    await createIssueCommand.execute({
      title: values.title,
      description: values.description,
      reporterName: values.reporterName,
      startAt: values.startAt,
      waterZoneId: values.waterZoneId,
      status: values.status
    })
    router.push('/')
  }

  return (
    <div className="px-3 py-4 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Incidencia</h1>
          <p className="text-gray-600">Reporta una nueva incidencia o problema</p>
        </div>
      </div>

      <Form {...form}>
        <IssueForm
          form={form}
          waterZones={waterZones}
          onSubmit={onSubmit}
          onCancel={() => router.back()}
        ></IssueForm>
      </Form>
    </div>
  )
}
