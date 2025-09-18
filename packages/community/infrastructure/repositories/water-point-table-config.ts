import { createAutoTableConfig } from '@pda/common/domain'

export const waterPointTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'waterPoint'
})
