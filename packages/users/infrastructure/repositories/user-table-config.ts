import { createAutoTableConfig } from '@ph/common/domain'

export const userTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'user',
  defaultSort: { field: 'createdAt', direction: 'desc' }
})
