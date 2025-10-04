import { pdf } from '@react-pdf/renderer'
import { AnalysisPDF } from '../_components/analysis-pdf'

interface AnalysisData {
  id: string
  analysisType: string
  analyst: string
  analyzedAt: string | Date
  communityName: string
  zoneName?: string
  depositName?: string
  ph?: number
  chlorine?: number
  turbidity?: number
  description?: string
}

interface GeneratePDFProps {
  data: AnalysisData[]
  selectedTypes: string[]
  startDate: string
  endDate: string
  generatedAt: string
}

export async function generateAnalysisPDF({
  data,
  selectedTypes,
  startDate,
  endDate,
  generatedAt
}: GeneratePDFProps) {
  const blob = await pdf(
    <AnalysisPDF
      data={data}
      selectedTypes={selectedTypes}
      startDate={startDate}
      endDate={endDate}
      generatedAt={generatedAt}
    />
  ).toBlob()

  return blob
}
