import type React from 'react'

export default function PageContainer({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`w-full ${className}`}>{children}</div>
}
