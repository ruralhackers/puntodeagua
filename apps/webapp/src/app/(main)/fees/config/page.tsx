'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  expectedAmountPerPeriod,
  FeeFrequency,
  feeConfigUpsertSchema
} from '@pda/fees/domain'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import PageContainer from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import { frequencyLabels } from '../_lib/fee-labels'

const formSchema = feeConfigUpsertSchema
type FormData = z.infer<typeof formSchema>

export default function FeeConfigPage() {
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id
  const [isSubmitting, setIsSubmitting] = useState(false)
  const utils = api.useUtils()

  const { data: configResult, isLoading } = api.fees.getConfig.useQuery(
    { communityId: communityId || '' },
    { enabled: !!communityId }
  )

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      communityId: communityId || '',
      annualAmount: '100',
      frequency: 'ANNUAL',
      currency: 'EUR'
    }
  })

  useEffect(() => {
    if (configResult?.config && communityId) {
      form.reset({
        communityId,
        annualAmount: configResult.config.annualAmount,
        frequency: configResult.config.frequency,
        currency: configResult.config.currency
      })
    }
  }, [configResult, communityId, form])

  const upsertMutation = api.fees.upsertConfig.useMutation({
    onSuccess: () => {
      toast.success('Configuración guardada')
      utils.fees.getConfig.invalidate({ communityId })
      setIsSubmitting(false)
    },
    onError: (error) => {
      toast.error(error.message || 'No se pudo guardar la configuración')
      setIsSubmitting(false)
    }
  })

  const annualAmount = form.watch('annualAmount')
  const frequency = form.watch('frequency')
  const suggested =
    annualAmount && frequency
      ? expectedAmountPerPeriod(annualAmount, frequency).toString()
      : null

  if (!communityId) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          No se pudo determinar la comunidad del usuario
        </div>
      </PageContainer>
    )
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-muted-foreground">Cargando configuración...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6 max-w-xl">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/fees">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configuración de cobros</h1>
            <p className="text-muted-foreground">
              {configResult?.exists
                ? 'Cuota anual y frecuencia de la comunidad'
                : 'Aún no hay configuración guardada (defaults: 100 € / anual)'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cuota</CardTitle>
            <CardDescription>
              Define el importe anual y cada cuánto se cobra. La cuota por periodo se calcula
              automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => {
                  setIsSubmitting(true)
                  upsertMutation.mutate(data)
                })}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="annualAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Importe anual (€)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frecuencia</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona frecuencia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FeeFrequency.values().map((value) => (
                            <SelectItem key={value} value={value}>
                              {frequencyLabels[value]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {suggested && (
                  <FormDescription>
                    Cuota sugerida por periodo: <strong>{suggested} €</strong>
                  </FormDescription>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
