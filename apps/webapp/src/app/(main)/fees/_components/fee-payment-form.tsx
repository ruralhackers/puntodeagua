'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  buildDefaultPayerLabel,
  expectedAmountPerPeriod,
  feePaymentCreateSchema,
  type FeePaymentCreateDto,
  type FeePaymentDto
} from '@pda/fees/domain'
import { Save } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/trpc/react'
import {
  frequencyLabels,
  kindLabels,
  paymentMethodLabels,
  periodOptions
} from '../_lib/fee-labels'

const formSchema = feePaymentCreateSchema
type FormData = z.infer<typeof formSchema>

type FeePaymentFormProps = {
  communityId: string
  initialPayment?: FeePaymentDto
  preselectedWaterPointId?: string
  onSubmit: (data: FeePaymentCreateDto) => void
  isSubmitting: boolean
  submitLabel: string
}

export default function FeePaymentForm({
  communityId,
  initialPayment,
  preselectedWaterPointId,
  onSubmit,
  isSubmitting,
  submitLabel
}: FeePaymentFormProps) {
  const { data: configResult } = api.fees.getConfig.useQuery({ communityId })
  const { data: waterPoints = [] } = api.community.getWaterPointsByCommunityWithAccount.useQuery({
    communityId
  })

  const effectiveFrequency = configResult?.config.frequency ?? 'ANNUAL'
  const annualAmount = configResult?.config.annualAmount ?? '100'
  const suggestedAmount = expectedAmountPerPeriod(annualAmount, effectiveFrequency).toString()
  const lockedWaterPointId = preselectedWaterPointId || initialPayment?.waterPointId

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialPayment
      ? {
          communityId,
          waterPointId: initialPayment.waterPointId,
          payerLabel: initialPayment.payerLabel,
          kind: initialPayment.kind,
          amount: initialPayment.amount,
          paidAt: new Date(initialPayment.paidAt),
          frequency: initialPayment.frequency,
          periodYear: initialPayment.periodYear,
          periodIndex: initialPayment.periodIndex,
          paymentMethod: initialPayment.paymentMethod,
          notes: initialPayment.notes ?? ''
        }
      : {
          communityId,
          waterPointId: preselectedWaterPointId || '',
          payerLabel: '',
          kind: 'PERIODIC',
          amount: suggestedAmount,
          paidAt: new Date(),
          frequency: effectiveFrequency,
          periodYear: new Date().getFullYear(),
          periodIndex: 1,
          paymentMethod: undefined as unknown as FormData['paymentMethod'],
          notes: ''
        }
  })

  const kind = form.watch('kind')
  const waterPointId = form.watch('waterPointId')
  const isPeriodic = kind === 'PERIODIC'
  const payerLabelTouched = useRef(false)
  const hideWaterPointSelect = Boolean(preselectedWaterPointId)

  useEffect(() => {
    if (preselectedWaterPointId) {
      form.setValue('waterPointId', preselectedWaterPointId)
    }
  }, [preselectedWaterPointId, form])

  useEffect(() => {
    if (!initialPayment && configResult) {
      form.setValue('frequency', effectiveFrequency)
      if (form.getValues('kind') === 'PERIODIC') {
        form.setValue('amount', suggestedAmount)
      }
    }
  }, [configResult, effectiveFrequency, suggestedAmount, form, initialPayment])

  useEffect(() => {
    if (isPeriodic) {
      form.setValue('frequency', effectiveFrequency)
      if (form.getValues('periodYear') == null) {
        form.setValue('periodYear', new Date().getFullYear())
      }
      if (form.getValues('periodIndex') == null) {
        form.setValue('periodIndex', 1)
      }
    } else {
      form.setValue('frequency', null)
      form.setValue('periodYear', null)
      form.setValue('periodIndex', null)
    }
  }, [isPeriodic, effectiveFrequency, form])

  useEffect(() => {
    if (payerLabelTouched.current || !waterPointId) return
    const point = waterPoints.find((p) => p.id === waterPointId)
    if (!point) return
    form.setValue('payerLabel', buildDefaultPayerLabel(point.name, point.waterAccountName))
  }, [waterPointId, waterPoints, form])

  const selectedPoint = useMemo(
    () => waterPoints.find((p) => p.id === (lockedWaterPointId || waterPointId)),
    [waterPoints, lockedWaterPointId, waterPointId]
  )
  const periodSelectOptions = useMemo(
    () => (isPeriodic ? periodOptions(effectiveFrequency) : []),
    [isPeriodic, effectiveFrequency]
  )

  const paidAtValue = form.watch('paidAt')
  const paidAtInputValue = useMemo(() => {
    const date = paidAtValue instanceof Date ? paidAtValue : new Date(paidAtValue)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 10)
  }, [paidAtValue])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="kind"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(kindLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="waterPointId"
          render={({ field }) =>
            hideWaterPointSelect ? (
              <FormItem>
                <FormLabel>Punto de agua</FormLabel>
                <Input
                  value={
                    selectedPoint
                      ? [
                          selectedPoint.waterAccountName,
                          selectedPoint.connectionNumber
                            ? `${selectedPoint.name} (${selectedPoint.connectionNumber})`
                            : selectedPoint.name
                        ]
                          .filter(Boolean)
                          .join(' · ')
                      : 'Cargando…'
                  }
                  disabled
                />
                <input type="hidden" {...field} />
                <FormMessage />
              </FormItem>
            ) : (
              <FormItem>
                <FormLabel>Punto de agua</FormLabel>
                <Select
                  onValueChange={(value) => {
                    payerLabelTouched.current = false
                    field.onChange(value)
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona punto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {waterPoints.map((point) => (
                      <SelectItem key={point.id} value={point.id}>
                        {point.waterAccountName
                          ? `${point.waterAccountName} · ${
                              point.connectionNumber
                                ? `${point.name} (${point.connectionNumber})`
                                : point.name
                            }`
                          : point.connectionNumber
                            ? `${point.name} (${point.connectionNumber})`
                            : point.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )
          }
        />

        <FormField
          control={form.control}
          name="payerLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titular / concepto</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    payerLabelTouched.current = true
                    field.onChange(e)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isPeriodic && (
          <>
            <FormItem>
              <FormLabel>Frecuencia</FormLabel>
              <Input
                value={frequencyLabels[effectiveFrequency as keyof typeof frequencyLabels] ?? effectiveFrequency}
                disabled
              />
            </FormItem>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="periodYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodo</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value != null ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona periodo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {periodSelectOptions.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importe (€)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...field}
                  placeholder={isPeriodic ? suggestedAmount : '0.00'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paidAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de cobro</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={paidAtInputValue}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forma de pago</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona forma de pago" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(paymentMethodLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={
                    kind === 'SANCTION' || kind === 'EXTRA' ? 'Motivo…' : 'Notas opcionales'
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
