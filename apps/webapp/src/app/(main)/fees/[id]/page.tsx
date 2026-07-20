'use client'

import type { FeePaymentCreateDto } from '@pda/fees/domain'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import PageContainer from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import FeePaymentForm from '../_components/fee-payment-form'

export default function FeePaymentDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: payment,
    isLoading,
    error
  } = api.fees.getPaymentById.useQuery({ id: params.id }, { enabled: !!params.id })

  const updateMutation = api.fees.updatePayment.useMutation({
    onSuccess: () => {
      toast.success('Cobro actualizado')
      router.push('/fees')
    },
    onError: (error) => {
      toast.error(error.message || 'No se pudo actualizar el cobro')
      setIsSubmitting(false)
    }
  })

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
        <div className="text-muted-foreground">Cargando cobro...</div>
      </PageContainer>
    )
  }

  if (error || !payment) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          {error?.message || 'Cobro no encontrado'}
        </div>
      </PageContainer>
    )
  }

  const handleSubmit = (data: FeePaymentCreateDto) => {
    setIsSubmitting(true)
    const { communityId: _communityId, ...updateData } = data
    updateMutation.mutate({
      id: payment.id,
      data: updateData
    })
  }

  return (
    <PageContainer>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/fees">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cobro #{payment.number}</h1>
            <p className="text-muted-foreground">Editar registro de cobro</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos del cobro</CardTitle>
            <CardDescription>El número #{payment.number} no se puede modificar.</CardDescription>
          </CardHeader>
          <CardContent>
            <FeePaymentForm
              communityId={communityId}
              initialPayment={payment}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Guardar cambios"
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
