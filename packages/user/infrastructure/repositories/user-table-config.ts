import { createAutoTableConfig } from '@pda/common/domain'

export const userTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'user'
})
