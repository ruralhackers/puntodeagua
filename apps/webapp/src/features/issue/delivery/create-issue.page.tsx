'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { DateTime } from 'core'
import { createIssueSchema, type WaterZoneDto } from 'features'
import type { CreateIssueSchema } from 'features/issues/schemas/create-issue.schema'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { PageHeader } from '@/src/components/shared-data/page-header'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { CreateIssueCmd } from '@/src/features/issue/application/create-issue.cmd'
import { IssueForm } from '@/src/features/issue/delivery/issue-form'
import { useAuth } from '../../auth/context/auth-context'

interface CreateIssuePageProps {
  waterZones: WaterZoneDto[]
}

export const CreateIssuePage: NextPage<CreateIssuePageProps> = ({ waterZones }) => {
  const router = useRouter()
  const createIssueCommand = useUseCase(CreateIssueCmd)
  const { user } = useAuth()

  const form = useForm<CreateIssueSchema>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: '',
      waterZoneId: '',
      description: '',
      startAt: DateTime.fromNow().toISO(),
      reporterName: '',
      status: 'open',
      endAt: '',
      communityId: user?.communityId ?? ''
    }
  })

  async function onSubmit(values: CreateIssueSchema) {
    await createIssueCommand.execute({
      title: values.title,
      description: values.description,
      reporterName: values.reporterName,
      startAt: values.startAt,
      endAt: values.endAt,
      waterZoneId: values.waterZoneId,
      status: values.status,
      communityId: user?.communityId ?? ''
    })
    router.push('/')
  }
  console.log('form', form.getValues())

  return (
    <div className="px-3 py-4 pb-20">
      <PageHeader title="Nueva incidencia" subtitle="Reporta una nueva incidencia o problema" />

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
