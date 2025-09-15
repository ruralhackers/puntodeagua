import type { SearchParams } from 'nuqs/server'
import CommunityTable from '@/features/communities/communities-table'
import { generatePageTitle } from '@/lib/utils'

export const metadata = {
  title: generatePageTitle('Communities')
}

type pageProps = {
  searchParams: Promise<SearchParams>
}

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams
  return <CommunityTable {...searchParams} />
}
