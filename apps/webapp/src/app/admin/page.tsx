import { redirect } from 'next/navigation'

import { auth } from '@/server/auth'

export const metadata = {
  title: 'Dashboard'
}

export default async function Dashboard() {
  const session = await auth()

  if (!session?.user) {
    return redirect('/')
  }

  return <>Coming Soon</>
}
