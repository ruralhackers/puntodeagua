import { createAutoTableConfig } from '@pda/common/domain'

export const analysisTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'analysis'
})
