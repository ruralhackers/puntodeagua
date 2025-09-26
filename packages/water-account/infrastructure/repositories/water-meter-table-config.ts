import { createAutoTableConfig } from '@pda/common/domain'

export const waterMeterTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'waterMeter'
})
