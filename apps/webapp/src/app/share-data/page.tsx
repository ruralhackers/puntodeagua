import type { NextPage } from 'next'
import { SUMMARY_REPOSITORY } from '@/src/core/di/injection-tokens'
import { webAppContainer } from '@/src/core/di/webapp.container'
import ShareDataPage from '@/src/features/share-data/delivery/ShareData.page'
import { GetSummaryQry } from '@/src/features/summary/application/get-summary.qry'
import type {
  SummaryRepository,
  SummaryResponse
} from '@/src/features/summary/infrastructure/summary.api-rest-repository'

const Page: NextPage = async () => {
  try {
    const summaryRepository = webAppContainer.get<SummaryRepository>(SUMMARY_REPOSITORY)
    const getSummaryQry = new GetSummaryQry(summaryRepository)
    const summaryData: SummaryResponse = await getSummaryQry.handle()

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
