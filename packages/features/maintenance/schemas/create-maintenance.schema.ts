import type { z } from 'zod'
import { maintenanceSchema } from './maintenance.schema.ts'

export type CreateMaintenanceSchema = z.infer<typeof createMaintenanceSchema>

export const createMaintenanceSchema = maintenanceSchema.omit({ id: true })
