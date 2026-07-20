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
import FeePaymentForm from '../../_components/fee-payment-form'

export default function NewFeePaymentForPointPage() {
  const params = useParams<{ waterPointId: string }>()
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id
  const waterPointId = params.waterPointId
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: waterPoints = [], isLoading } =
    api.community.getWaterPointsByCommunityWithAccount.useQuery(
      { communityId: communityId || '' },
      { enabled: !!communityId }
    )

  const selectedPoint = waterPoints.find((point) => point.id === waterPointId)

  const createMutation = api.fees.createPayment.useMutation({
    onSuccess: () => {
      toast.success('Cobro registrado')
      router.push('/fees')
    },
    onError: (error) => {
      toast.error(error.message || 'No se pudo registrar el cobro')
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
        <div className="text-muted-foreground">Cargando punto de agua...</div>
      </PageContainer>
    )
  }

  if (!selectedPoint) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="text-center text-destructive">Punto de agua no encontrado</div>
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/fees/new">Volver a la lista</Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }

  const handleSubmit = (data: FeePaymentCreateDto) => {
    setIsSubmitting(true)
    createMutation.mutate({ ...data, waterPointId })
  }

  const pointTitle = selectedPoint.connectionNumber
    ? `${selectedPoint.name} (${selectedPoint.connectionNumber})`
    : selectedPoint.name

  return (
    <PageContainer>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/fees/new">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Registrar cobro</h1>
            <p className="text-muted-foreground">{pointTitle}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos del cobro</CardTitle>
            <CardDescription>
              El número correlativo se asigna automáticamente al guardar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeePaymentForm
              communityId={communityId}
              preselectedWaterPointId={waterPointId}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Registrar cobro"
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
