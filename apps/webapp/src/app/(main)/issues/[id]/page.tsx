'use client'

import { ArrowLeft, Calendar, CheckCircle, Edit, MapPin, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { api } from '@/trpc/react'

export default function IssueDetailPage() {
  const params = useParams()
  const issueId = params.id as string
  const [isUpdating, setIsUpdating] = useState(false)

  const {
    data: issue,
    isLoading,
    error,
    refetch
  } = api.issues.getIssueById.useQuery({ id: issueId }, { enabled: !!issueId })

  const updateIssueMutation = api.issues.updateIssue.useMutation({
    onSuccess: () => {
      toast.success('Issue updated successfully')
      refetch()
      setIsUpdating(false)
    },
    onError: (error) => {
      toast.error('Failed to update issue: ' + error.message)
      setIsUpdating(false)
    }
  })

  const handleStatusChange = (newStatus: 'open' | 'closed') => {
    if (!issue) return

    setIsUpdating(true)
    updateIssueMutation.mutate({
      ...issue,
      status: newStatus,
      endAt: newStatus === 'closed' ? new Date() : undefined
    })
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading issue...</div>
        </div>
      </PageContainer>
    )
  }

  if (error || !issue) {
    return (
      <PageContainer>
        <div className="text-center text-destructive">
          {error ? `Error loading issue: ${error.message}` : 'Issue not found'}
        </div>
      </PageContainer>
    )
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive'
      case 'closed':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLocationText = () => {
    if (issue.waterPointId) return 'Water Point'
    if (issue.waterDepositId) return 'Water Deposit'
    if (issue.waterZoneId) return 'Water Zone'
    return 'Community'
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/issues">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Issues
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{issue.title}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                <span className="text-sm text-muted-foreground">
                  Reported by {issue.reporterName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {issue.status === 'open' && (
              <Button
                onClick={() => handleStatusChange('closed')}
                disabled={isUpdating}
                variant="outline"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isUpdating ? 'Closing...' : 'Close Issue'}
              </Button>
            )}
            {issue.status === 'closed' && (
              <Button
                onClick={() => handleStatusChange('open')}
                disabled={isUpdating}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isUpdating ? 'Reopening...' : 'Reopen Issue'}
              </Button>
            )}
            <Link href={`/issues/${issue.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {issue.description ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">{issue.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No description provided</p>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Issue Created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(issue.startAt)}</p>
                  </div>
                </div>

                {issue.endAt && (
                  <>
                    <Separator />
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Issue Closed</p>
                        <p className="text-sm text-muted-foreground">{formatDate(issue.endAt)}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Issue Details */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Reporter</p>
                    <p className="text-sm text-muted-foreground">{issue.reporterName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(issue.startAt)}</p>
                  </div>
                </div>

                {issue.endAt && (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">End Date</p>
                      <p className="text-sm text-muted-foreground">{formatDate(issue.endAt)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{getLocationText()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                  {issue.status === 'open' && (
                    <Button
                      onClick={() => handleStatusChange('closed')}
                      disabled={isUpdating}
                      size="sm"
                      variant="outline"
                    >
                      {isUpdating ? 'Closing...' : 'Close'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
