import type { NextPage } from 'next'
import ShareDataPage from '@/src/features/share-data/delivery/ShareData.page'

interface SummaryData {
  analyses: any[]
  issues: any[]
  maintenance: any[]
}

const fetchSummaryData = async (): Promise<SummaryData> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  
  try {
    const response = await fetch(`${apiUrl}/api/summary`, {
      cache: 'no-store' // Always fetch fresh data
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch summary data: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching summary data:', error)
    // Return empty data on error
    return {
      analyses: [],
      issues: [],
      maintenance: []
    }
  }
}

const Page: NextPage = async () => {
  const summaryData = await fetchSummaryData()
  
  return <ShareDataPage summaryData={summaryData} />
}

export default Page
