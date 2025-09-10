'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useId, useState } from 'react'
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

const FormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' })
})

export function LoginForm() {
  const emailId = useId()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true)
    try {
      const result = await signIn('email', {
        email: data.email,
        redirect: false
      })

      if (result?.error) {
        toast.error('Error sending magic link', {
          description: 'Please check your email address and try again.'
        })
      } else {
        setEmailSent(true)
        setSentEmail(data.email)
      }
    } catch {
      toast.error('An error occurred', {
        description: 'Please try again later.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show email verification message if email was sent successfully
  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
          <p className="text-gray-600">
            We've sent a magic link to{' '}
            <span className="font-medium text-gray-900">{sentEmail}</span>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in your email to sign in to your account.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setEmailSent(false)
            setSentEmail('')
            form.reset()
          }}
          className="w-full cursor-pointer"
        >
          Try different email
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  id={emailId}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          type="submit"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Sending...' : 'Send Magic Link'}
        </Button>
      </form>
    </Form>
  )
}
