'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { userSchema } from '@ph/users/domain'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { api } from '@/trpc/react'

const formSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1, 'Username required'),
  credits: z.number().int().nonnegative(),
  admin: z.boolean(),
  moderator: z.boolean(),
  verified: z.boolean(),
  banned: z.boolean(),
  nsfw: z.boolean()
})

type UserDto = z.infer<typeof userSchema>
type FormValues = z.infer<typeof formSchema>

export function UserForm({ initialData }: { initialData: UserDto | null }) {
  const router = useRouter()
  const utils = api.useUtils()
  const { mutateAsync: updateUser, status } = api.user.update.useMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: initialData
      ? {
          id: initialData.id,
          username: initialData.username ?? '',
          credits: initialData.credits ?? 0,
          admin: initialData.admin ?? false,
          moderator: initialData.moderator ?? false,
          verified: initialData.verified ?? false,
          banned: initialData.banned ?? false,
          nsfw: initialData.nsfw ?? false
        }
      : {
          id: '',
          username: '',
          credits: 0,
          admin: false,
          moderator: false,
          verified: false,
          banned: false,
          nsfw: false
        }
  })

  if (!initialData) return <div>User not found</div>

  async function onSubmit(values: FormValues) {
    if (!initialData) return
    // Compose full payload expected by update (userSchema.partial + id) using initialData for immutable fields.
    await updateUser({
      id: values.id,
      username: values.username,
      credits: values.credits,
      admin: values.admin,
      moderator: values.moderator,
      verified: values.verified,
      banned: values.banned,
      nsfw: values.nsfw,
      // immutable / other fields from initialData
      email: initialData.email,
      createdAt: initialData.createdAt,
      updatedAt: initialData.updatedAt,
      profileViewCount: initialData.profileViewCount,
      promptCount: initialData.promptCount,
      favCount: initialData.favCount,
      searchCount: initialData.searchCount,
      streakDays: initialData.streakDays,
      emailVerified: initialData.emailVerified ?? null,
      lockedAt: initialData.lockedAt ?? null,
      streakStart: initialData.streakStart ?? null,
      streakEnd: initialData.streakEnd ?? null
    })
    await utils.user.getById.invalidate({ id: values.id })
    toast.success('User updated successfully')
    router.push('/dashboard/users')
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Edit User</h1>
        <p className="text-sm text-muted-foreground">ID: {initialData.id}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credits</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            {(['admin', 'moderator', 'verified', 'banned', 'nsfw'] as const).map((flag) => (
              <FormField
                key={flag}
                control={form.control}
                name={flag}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="size-4"
                      />
                    </FormControl>
                    <FormLabel className="m-0 cursor-pointer text-sm font-medium">{flag}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <div className="max-w-sm">
            <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">
              Email (read-only)
            </label>
            <Input id="email" disabled value={initialData.email} className="mt-1" />
          </div>
          <input type="hidden" {...form.register('id')} />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/users')}
              disabled={status === 'pending'}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={status === 'pending'}>
              {status === 'pending' && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
