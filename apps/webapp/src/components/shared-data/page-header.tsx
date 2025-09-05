'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation'
import type * as React from 'react'

interface PageHeaderProps {
  title: string
  subtitle: string,
  subtitleClassName?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  subtitleClassName,
}) => {
  const router = useRouter()

  return (
    <div className="mb-6">
      <div className="mb-4">
        <Link
          href="#"
          onClick={() => router.back()}
          type="invisible"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <span className="p-2 hover:bg-gray-100 rounded-lg">
            <svg
              aria-hidden="true"
              focusable="false"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </span>
          <span className="text-sm">Volver</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className={subtitleClassName ?? 'text-gray-600'}>{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
