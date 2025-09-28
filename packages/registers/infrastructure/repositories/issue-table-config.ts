import { createAutoTableConfig } from '@pda/common/domain'

export const issueTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'issue'
})
