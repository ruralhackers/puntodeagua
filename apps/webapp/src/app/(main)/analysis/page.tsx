'use client'

import type { AnalysisDto } from '@pda/registers/domain'
import { Plus, TestTube } from 'lucide-react'
import { useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import AddAnalysisModal from './_components/add-analysis-modal'
import AnalysisCard from './_components/analysis-card'

export default function AnalysisPage() {
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id
  const [isAddAnalysisModalOpen, setIsAddAnalysisModalOpen] = useState(false)

  const {
    data: analyses,
    isLoading,
    error
  } = api.registers.getAnalysesByCommunityId.useQuery(
    { id: communityId || '' },
    { enabled: !!communityId }
  )

  const handleViewDetails = (analysis: AnalysisDto) => {
    // TODO: Open analysis detail modal or navigate to detail page
    console.log('View details for analysis:', analysis.id)
  }

  if (!communityId) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          No se pudo determinar la comunidad del usuario
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Análisis de Agua</h1>
            <p className="text-muted-foreground">
              Gestiona los análisis de calidad del agua de tu comunidad
            </p>
          </div>
          <Button onClick={() => setIsAddAnalysisModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Análisis
          </Button>
        </div>

        {/* Analyses List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Análisis Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <div className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-destructive">
                Error al cargar los análisis: {error.message}
              </div>
            ) : !analyses || analyses.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <TestTube className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No hay análisis registrados para esta comunidad</p>
                <p className="text-sm mt-1">Añade el primer análisis para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map((analysis) => (
                  <AnalysisCard
                    key={analysis.id}
                    analysis={analysis}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Analysis Modal */}
        {communityId && (
          <AddAnalysisModal
            isOpen={isAddAnalysisModalOpen}
            onClose={() => setIsAddAnalysisModalOpen(false)}
            communityId={communityId}
          />
        )}
      </div>
    </PageContainer>
  )
}
