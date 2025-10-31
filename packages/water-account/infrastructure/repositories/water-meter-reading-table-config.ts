import { createAutoTableConfig } from '@pda/common/domain'

export const waterMeterReadingTableConfig = createAutoTableConfig({
  databaseType: 'prisma' as const,
  modelName: 'waterMeterReading',
  relations: ['waterMeterReadingImage']
})
