'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ExportNavigationProps {
  onBack?: () => void
  onNext?: () => void
  backHref?: string
  nextHref?: string
  nextDisabled?: boolean
  nextLabel?: string
  backLabel?: string
  showBack?: boolean
  showNext?: boolean
}

export function ExportNavigation({
  onBack,
  onNext,
  backHref,
  nextHref,
  nextDisabled = false,
  nextLabel = 'Continuar',
  backLabel = 'Volver',
  showBack = true,
  showNext = true
}: ExportNavigationProps) {
  return (
    <div className="flex justify-between">
      {showBack && (
        <>
          {backHref ? (
            <Button variant="outline" asChild>
              <Link href={backHref}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backLabel}
              </Link>
            </Button>
          ) : onBack ? (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Button>
          ) : null}
        </>
      )}

      {showNext && (
        <>
          {nextHref ? (
            <Button asChild disabled={nextDisabled}>
              <Link href={nextHref}>
                {nextLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : onNext ? (
            <Button onClick={onNext} disabled={nextDisabled}>
              {nextLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </>
      )}
    </div>
  )
}
