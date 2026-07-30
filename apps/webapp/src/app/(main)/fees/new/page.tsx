'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { WaterPointList } from './_components/water-point-list'

export default function NewFeePaymentSelectPage() {
  const [nameFilter, setNameFilter] = useState('')

  return (
    <PageContainer>
      <div className="flex flex-col w-full space-y-6">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0 mt-1">
            <Link href="/fees">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Registrar cobro</h1>
            <p className="text-muted-foreground">
              Elige el punto de agua para el que quieres registrar el cobro
            </p>
          </div>
        </div>

        <div className="w-full max-w-md">
          <SearchInput
            value={nameFilter}
            onChange={setNameFilter}
            placeholder="Buscar por nombre, nº enganche o titular..."
          />
        </div>

        <WaterPointList nameFilter={nameFilter} />
      </div>
    </PageContainer>
  )
}
