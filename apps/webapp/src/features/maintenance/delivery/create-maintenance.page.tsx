'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { WaterZoneDto } from 'features'
import { createMaintenanceSchema } from 'features'
import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Form } from '@/components/ui/form'
import { PageHeader } from '@/src/components/shared-data/page-header'
import { useUseCase } from '@/src/core/use-cases/use-use-case'
import { CreateMaintenanceCmd } from '@/src/features/maintenance/application/create-maintenance.cmd'
import { MaintenanceForm } from '@/src/features/maintenance/delivery/maintenance-form'
import { useAuth } from '../../auth/context/auth-context'

export const CreateMaintenancePage: NextPage<{
  waterZones: WaterZoneDto[]
}> = ({ waterZones }) => {
  const { user } = useAuth()
  const router = useRouter()
  const createMaintenanceCommand = useUseCase(CreateMaintenanceCmd)

  type FormValues = z.infer<typeof createMaintenanceSchema>

  const form = useForm<FormValues>({
    resolver: zodResolver(createMaintenanceSchema),
    defaultValues: {
      name: '',
      waterZoneId: '',
      scheduledDate: new Date(),
      responsible: '',
      executionDate: undefined,
      duration: undefined,
      nextMaintenanceDate: undefined,
      description: '',
      observations: '',
      communityId: user?.communityId ?? ''
    }
  })

  async function onSubmit(values: FormValues) {
    await createMaintenanceCommand.execute(values)
    router.push('/dashboard/registros/mantenimiento')
  }

  return (
    <div className="px-3 py-4 pb-20">
      <PageHeader title="Nuevo mantenimiento" subtitle="Registra una actividad de mantenimiento" />

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
