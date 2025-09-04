import type { Deletable } from 'core/repositories/deletable'
import type { FindableAll } from 'core/repositories/findable-all'
import type { FindableById } from 'core/repositories/findable-by-id'
import type { Savable } from 'core/repositories/savable'
import type { Maintenance } from '../entities/maintenance'

export interface MaintenanceRepository
  extends Savable<Maintenance>,
    Deletable<Maintenance>,
    FindableById<Maintenance>,
    FindableAll<Maintenance> {}
