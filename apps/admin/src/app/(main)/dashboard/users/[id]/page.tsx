import { Suspense } from 'react'
import FormCardSkeleton from '@/components/form-card-skeleton'
import UserEditPage from '@/features/users/user-edit-page'
import { generatePageTitle } from '@/lib/utils'

export const metadata = {
  title: generatePageTitle('Edit user')
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <Suspense fallback={<FormCardSkeleton />}>
        <UserEditPage id={id} />
      </Suspense>
    </div>
  )
}
