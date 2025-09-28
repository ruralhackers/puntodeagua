'use client'

import { AlertTriangle, Plus } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/stores/user/user-provider'
import { api } from '@/trpc/react'
import AddIssueModal from './_components/add-issue-modal'
import IssueCard from './_components/issue-card'

export default function IssuesPage() {
  const user = useUserStore((state) => state.user)
  const communityId = user?.community?.id
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if modal should be opened by default based on URL parameter
  const shouldOpenModal = searchParams.get('create-issue') === 'true'
  const [isAddIssueModalOpen, setIsAddIssueModalOpen] = useState(shouldOpenModal)

  const {
    data: issues,
    isLoading,
    error
  } = api.issues.getIssuesByCommunityId.useQuery(
    { id: communityId || '' },
    { enabled: !!communityId }
  )

  // Function to handle modal close and clean URL
  const handleModalClose = () => {
    setIsAddIssueModalOpen(false)
    // Clean the URL parameter when modal is closed
    if (searchParams.get('create-issue') === 'true') {
      router.replace('/issue')
    }
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

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando incidencias...</div>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          Error al cargar las incidencias: {error.message}
        </div>
      </PageContainer>
    )
  }

  const openIssues = issues?.filter((issue) => issue.status === 'open') || []
  const closedIssues = issues?.filter((issue) => issue.status === 'closed') || []

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Incidencias</h1>
            <p className="text-muted-foreground">
              Gestiona y rastrea las incidencias en la infraestructura de agua de tu comunidad
            </p>
          </div>
          <Button onClick={() => setIsAddIssueModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Incidencia
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Incidencias</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{issues?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidencias Abiertas</CardTitle>
              <Badge variant="destructive" className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{openIssues.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidencias Cerradas</CardTitle>
              <Badge variant="secondary" className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{closedIssues.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Open Issues */}
        {openIssues.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Incidencias Abiertas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {openIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        )}

        {/* Closed Issues */}
        {closedIssues.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Incidencias Cerradas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {closedIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {issues?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron incidencias en tu comunidad
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Aún no se han reportado incidencias en tu comunidad.
              </p>
              <Button onClick={() => setIsAddIssueModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Reportar Primera Incidencia de tu comunidad
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Issue Modal */}
      <AddIssueModal
        isOpen={isAddIssueModalOpen}
        onClose={handleModalClose}
        communityId={communityId}
      />
    </PageContainer>
  )
}
