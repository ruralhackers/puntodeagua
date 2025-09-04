'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Issue, type IssueSchema, issueSchema, type WaterZoneDto } from 'features'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { SaveIssueCmd } from '@/src/features/issue/application/save-issue.cmd'
import { IssueForm } from '@/src/features/issue/delivery/issue-form'

export const EditIssuePage: NextPage<{
  id: string
  waterZones: WaterZoneDto[]
}> = ({ waterZones, id }) => {
  const router = useRouter()
  const saveIssueCommand = useUseCase(SaveIssueCmd)

  const form = useForm<IssueSchema>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: '',
      waterZoneId: '',
      description: '',
      startAt: new Date(),
      reporterName: '',
      status: 'open'
      // tipo: '',
      // prioridad: '',
      // puntoAgua: '',
      // fecha: '',
      // hora: '',
      // accionesRealizadas: '',
      // observaciones: ''
    }
  })

  async function onSubmit(values: IssueSchema) {
    await saveIssueCommand.execute(
      Issue.fromDto({
        id,
        title: values.title,
        description: values.description,
        reporterName: values.reporterName,
        startAt: values.startAt,
        waterZoneId: values.waterZoneId,
        status: values.status
      })
    )
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
