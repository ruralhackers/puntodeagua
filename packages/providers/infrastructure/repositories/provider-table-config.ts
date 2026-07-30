import { createAutoTableConfig } from '@pda/common/domain'

export const providerTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'provider',
  defaultSort: { field: 'companyName', direction: 'asc' as const }
})
