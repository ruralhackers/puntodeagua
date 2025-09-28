import type { SearchParams } from 'nuqs/server'
import AnalysisTable from '@/features/analysis/analysis-table'
import { generatePageTitle } from '@/lib/utils'

export const metadata = {
  title: generatePageTitle('Analysis')
}

type pageProps = {
  searchParams: Promise<SearchParams>
}

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams
  return <AnalysisTable {...searchParams} />
}
