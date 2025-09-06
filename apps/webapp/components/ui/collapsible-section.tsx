'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

interface CollapsibleSectionProps {
  title: string
  description?: string
  icon?: ReactNode
  children: ReactNode
  defaultExpanded?: boolean
  className?: string
}

export function CollapsibleSection({
  title,
  description,
  icon,
  children,
  defaultExpanded = false,
  className = ''
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <Card className={className}>
      <button
        type="button"
        className="w-full cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsExpanded(!isExpanded)
          }
        }}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Colapsar' : 'Expandir'} sección ${title}`}
      >
        <CardHeader className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <div>
                <CardTitle className="text-left">{title}</CardTitle>
                {description && (
                  <CardDescription className="text-left">{description}</CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>
        </CardHeader>
      </button>

      {isExpanded && <CardContent>{children}</CardContent>}
    </Card>
  )
}
