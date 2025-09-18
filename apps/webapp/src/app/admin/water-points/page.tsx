import type { SearchParams } from 'nuqs/server'
import WaterPointTable from '@/features/water-points/water-points-table'
import { generatePageTitle } from '@/lib/utils'

export const metadata = {
  title: generatePageTitle('Water Points')
}

type pageProps = {
  searchParams: Promise<SearchParams>
}

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams
  return <WaterPointTable {...searchParams} />
}
