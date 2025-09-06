'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { MaintenanceSchema, WaterZoneDto } from 'features'
import { maintenanceSchema } from 'features/maintenance/schemas/maintenance.schema'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Form } from '@/components/ui/form'
import { PageHeader } from '@/src/components/shared-data/page-header'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { MaintenanceForm } from '@/src/features/maintenance/delivery/maintenance-form'
import { EditMaintenanceCmd } from '../application/edit-maintenance.cmd'

type FormValues = z.infer<typeof maintenanceSchema>

export const EditMaintenancePage: NextPage<{
  maintenance: MaintenanceSchema
  waterZones: WaterZoneDto[]
}> = ({ maintenance, waterZones }) => {
  const router = useRouter()
  const editMaintenanceCommand = useUseCase(EditMaintenanceCmd)

  const form = useForm<FormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      ...maintenance,
      scheduledDate: maintenance.scheduledDate ? new Date(maintenance.scheduledDate) : undefined
    }
  })

  async function onSubmit(values: FormValues) {
    await editMaintenanceCommand.execute(values)
    router.push(`/dashboard/registros/mantenimiento`)
  }

  return (
    <div className="px-3 py-4 pb-20">
      <PageHeader title="Editar mantenimiento" subtitle="Actualiza los datos del mantenimiento" />

      <Form {...form}>
        <MaintenanceForm
          form={form}
          waterZones={waterZones}
          onSubmit={onSubmit}
          onCancel={() => router.back()}
        />
      </Form>
    </div>
  )
}
