import { createAutoTableConfig } from '@pda/common/domain'

export const waterDepositTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'waterDeposit'
})
