import type { SearchParams } from 'nuqs/server'
import UsersTable from '@/features/users/users-table'
import { generatePageTitle } from '@/lib/utils'

export const metadata = {
  title: generatePageTitle('Users')
}

type pageProps = {
  searchParams: Promise<SearchParams>
}

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams
  return <UsersTable {...searchParams} />
}
