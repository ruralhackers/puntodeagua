'use client'

import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface ExportBreadcrumbProps {
  items: BreadcrumbItem[]
}

export function ExportBreadcrumb({ items }: ExportBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {item.href && !item.current ? (
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className={item.current ? 'text-foreground' : ''}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
