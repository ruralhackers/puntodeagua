import { Id, UseCaseService } from 'core'
import { webAppContainer } from '@/src/core/di/webapp.container'
import ShareDataPage from '@/src/features/share-data/delivery/ShareData.page'
import { GetSummaryQry } from '@/src/features/summary/application/get-summary.qry'
import type { SummaryResponse } from '@/src/features/summary/infrastructure/summary.api-rest-repository'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const useCaseService = webAppContainer.get<UseCaseService>(UseCaseService.ID)
    const summaryData: SummaryResponse = await useCaseService.execute(GetSummaryQry, Id.create(id))

    return <ShareDataPage summaryData={summaryData} />
  } catch (error) {
    console.error('Failed to fetch summary data:', error)

    // Fallback to empty data if API fails
    const fallbackData: SummaryResponse = {
      analyses: [],
      issues: [],
      maintenance: []
    }

    return <ShareDataPage summaryData={fallbackData} />
  }
}

export default Page
