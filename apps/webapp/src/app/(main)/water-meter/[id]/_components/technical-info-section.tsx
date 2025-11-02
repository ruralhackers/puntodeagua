import { Badge } from '@/components/ui/badge'

interface TechnicalInfoSectionProps {
  measurementUnit: string
  isActive: boolean
}

export function TechnicalInfoSection({ measurementUnit, isActive }: TechnicalInfoSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Información Técnica
      </h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-500">Unidad: </span>
          <span className="font-mono">{measurementUnit}</span>
        </div>
        <div>
          <span className="text-gray-500">Estado: </span>
          <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
            {isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>
    </div>
  )
}
