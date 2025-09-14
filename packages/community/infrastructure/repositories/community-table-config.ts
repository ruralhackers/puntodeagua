import { createAutoTableConfig } from '@pda/common/domain'

export const communityTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'community'
})
