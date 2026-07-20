'use client'

import { Plus, Settings } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import FeePaymentActions from './_components/fee-payment-actions'
import {
  formatAmount,
  formatPeriod,
  kindLabels,
  paymentMethodLabels
} from './_lib/fee-labels'

export default function FeesPage() {
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id
  const [kindFilter, setKindFilter] = useState<string>('ALL')

  const {
    data: payments,
    isLoading,
    error
  } = api.fees.listPayments.useQuery(
    {
      communityId: communityId || '',
      kind: kindFilter === 'ALL' ? undefined : (kindFilter as 'PERIODIC' | 'SANCTION' | 'EXTRA')
    },
    { enabled: !!communityId }
  )

  const { data: waterPoints = [] } = api.community.getWaterPointsByCommunityWithAccount.useQuery(
    { communityId: communityId || '' },
    { enabled: !!communityId }
  )

  const waterPointNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const point of waterPoints) {
      map.set(
        point.id,
        point.connectionNumber ? `${point.name} (${point.connectionNumber})` : point.name
      )
    }
    return map
  }, [waterPoints])

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
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando cobros...</div>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          Error al cargar los cobros: {error.message}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cobros</h1>
            <p className="text-muted-foreground">
              {payments?.length ?? 0} {(payments?.length ?? 0) === 1 ? 'registro' : 'registros'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/fees/config">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/fees/new">
                <Plus className="h-4 w-4 mr-2" />
                Registrar cobro
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="max-w-xs">
              <Select value={kindFilter} onValueChange={setKindFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los tipos</SelectItem>
                  {Object.entries(kindLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 overflow-x-auto">
            {!payments?.length ? (
              <div className="text-center text-muted-foreground py-8">
                No hay cobros registrados todavía.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Titular</TableHead>
                    <TableHead>Punto</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Importe</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">#{payment.number}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {kindLabels[payment.kind as keyof typeof kindLabels] ?? payment.kind}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.payerLabel}</TableCell>
                      <TableCell>
                        {waterPointNameById.get(payment.waterPointId) ?? payment.waterPointId}
                      </TableCell>
                      <TableCell>
                        {formatPeriod(payment.frequency, payment.periodYear, payment.periodIndex)}
                      </TableCell>
                      <TableCell>{formatAmount(payment.amount)}</TableCell>
                      <TableCell>
                        {paymentMethodLabels[
                          payment.paymentMethod as keyof typeof paymentMethodLabels
                        ] ?? payment.paymentMethod}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.paidAt).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        <FeePaymentActions payment={payment} communityId={communityId} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
