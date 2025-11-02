import { pdf } from '@react-pdf/renderer'
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
  waterPoint: {
    name: string
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
}

export async function generateReadingsPDF({
  data,
  startDate,
  endDate,
  generatedAt
}: GenerateReadingsPDFProps) {
  const blob = await pdf(
    <ReadingsPDF data={data} startDate={startDate} endDate={endDate} generatedAt={generatedAt} />
  ).toBlob()

  return blob
}
