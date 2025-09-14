'use client'

import { notFound } from 'next/navigation'
import { api } from '@/trpc/react'
import { UserForm } from './user-form'

export default function UserEditPage({ id }: { id: string }) {
  const { data, isLoading, error } = api.user.getById.useQuery({ id })

  console.log('data', data)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!data) {
    notFound()
  }

  return <UserForm initialData={data} />
}
