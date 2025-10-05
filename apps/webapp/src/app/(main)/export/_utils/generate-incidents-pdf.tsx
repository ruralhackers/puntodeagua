import { pdf } from '@react-pdf/renderer'
import { IncidentsPDF } from '../_components/incidents-pdf'

interface IncidentData {
  id: string
  title: string
  reporterName: string
  status: string
  startAt: string | Date
  endAt?: string | Date
  description?: string
  closingDescription?: string
  communityName?: string
  zoneName?: string
  depositName?: string
  pointName?: string
}

interface GenerateIncidentsPDFProps {
  data: IncidentData[]
  startDate: string
  endDate: string
  status: 'all' | 'open' | 'closed'
  generatedAt: string
}

export async function generateIncidentsPDF({
  data,
  startDate,
  endDate,
  status,
  generatedAt
}: GenerateIncidentsPDFProps) {
  const blob = await pdf(
    <IncidentsPDF
      data={data}
      startDate={startDate}
      endDate={endDate}
      status={status}
      generatedAt={generatedAt}
    />
  ).toBlob()

  return blob
}
