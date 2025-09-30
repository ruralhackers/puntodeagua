import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface CreatePageHeaderProps {
  // Navegación
  backHref: string
  backLabel?: string

  // Icono
  icon: React.ComponentType<{ className?: string }>
  iconBgColor: string
  iconColor: string

  // Contenido
  title: string
  description: string
}

export default function CreatePageHeader({
  backHref,
  backLabel = 'Volver',
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  description
}: CreatePageHeaderProps) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <div className={`p-2 ${iconBgColor} rounded-lg`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
