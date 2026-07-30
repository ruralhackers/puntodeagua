import { createAutoTableConfig } from '@pda/common/domain'

export const incidentTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'incident',
  defaultSort: { field: 'startAt', direction: 'desc' as const }
})
