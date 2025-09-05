'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { DateTime, Id } from 'core'
import { Issue, type IssueSchema, issueSchema, type WaterZoneDto } from 'features'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { EditIssueCmd } from '@/src/features/issue/application/edit-issue.cmd'
import { GetIssueByIdQry } from '@/src/features/issue/application/get-issue-by-id.qry'
import { IssueForm } from '@/src/features/issue/delivery/issue-form'
import { Link } from "@/components/ui/link";

export const EditIssuePage: NextPage<{
  id: string
  waterZones: WaterZoneDto[]
}> = ({ waterZones, id }) => {
  const router = useRouter()
  const editIssueCommand = useUseCase(EditIssueCmd)
  const getIssueByIdQry = useUseCase(GetIssueByIdQry)

  const form = useForm<IssueSchema>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: '',
      waterZoneId: '',
      description: '',
      startAt: DateTime.fromNow().toISO(),
      endAt: '',
      reporterName: '',
      status: 'open'
    }
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const fetchIssue = async () => {
      const issue = await getIssueByIdQry.execute(Id.create(id))
      const issueDto = issue.toDto()
      form.reset(issueDto)
    }
    fetchIssue()
  }, [])

  async function onSubmit(values: IssueSchema) {
    await editIssueCommand.execute(
      Issue.fromDto({
        ...values,
        id
      })
    )
    router.push('/dashboard/registros/incidencias')
  }

  return (
    <div className="px-3 py-4 pb-20">
      <div className="mb-6">
        <div className="mb-4">
          <Link
            to="/dashboard/registros/incidencias"
            type="invisible"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
              <span className="p-2 hover:bg-gray-100 rounded-lg">
                <svg
                  aria-hidden="true"
                  focusable="false"
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
              </span>
            <span className="text-sm">Volver</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Incidencia</h1>
        <p className="text-gray-600">Modifica los datos de la incidencia</p>
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
