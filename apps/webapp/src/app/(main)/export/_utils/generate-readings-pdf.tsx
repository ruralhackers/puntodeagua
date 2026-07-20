import { pdf } from '@react-pdf/renderer'
import { MeterReadingsDetailPDF } from '../_components/meter-readings-detail-pdf'
import { ReadingsPDF } from '../_components/readings-pdf'

interface ReadingData {
  normalizedReading: number
  readingDate: Date
}

interface WaterMeterReadingData {
  id: string
  name: string
  waterAccountName: string
  isActive: boolean
  readings: ReadingData[]
  totalConsumption?: number | null
  days?: number | null
  averageConsumptionPerDay?: number | null
  waterPoint: {
    name: string
    connectionNumber?: string | null
    fixedPopulation: number
    floatingPopulation: number
  }
  waterLimitRule: {
    type: string
    value: number
  }
  communityZone: {
    name: string
  }
}

interface GenerateReadingsPDFProps {
  data: WaterMeterReadingData[]
  startDate: string
  endDate: string
  generatedAt: string
  waterMeterId?: string
}

export async function generateReadingsPDF({
  data,
  startDate,
  endDate,
  generatedAt,
  waterMeterId
}: GenerateReadingsPDFProps) {
  if (waterMeterId && data[0]) {
    const meter = data[0]
    const blob = await pdf(
      <MeterReadingsDetailPDF
        data={{
          id: meter.id,
          name: meter.name,
          waterAccountName: meter.waterAccountName,
          readings: meter.readings,
          totalConsumption: meter.totalConsumption ?? null,
          days: meter.days ?? null,
          averageConsumptionPerDay: meter.averageConsumptionPerDay ?? null,
          waterPoint: {
            name: meter.waterPoint.name,
            connectionNumber: meter.waterPoint.connectionNumber
          },
          communityZone: meter.communityZone
        }}
        startDate={startDate}
        endDate={endDate}
        generatedAt={generatedAt}
      />
    ).toBlob()
    return blob
  }

  const blob = await pdf(
    <ReadingsPDF data={data} startDate={startDate} endDate={endDate} generatedAt={generatedAt} />
  ).toBlob()

  return blob
}
