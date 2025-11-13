import { Badge } from '@/components/ui/badge'
import { getProviderTypeLabel } from './provider-type-labels'

interface ProviderTypeBadgeProps {
  providerType: string
}

export default function ProviderTypeBadge({ providerType }: ProviderTypeBadgeProps) {
  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'plumbing':
        return 'default' as const
      case 'electricity':
        return 'secondary' as const
      case 'analysis':
        return 'outline' as const
      case 'masonry':
        return 'default' as const
      default:
        return 'default' as const
    }
  }

  return <Badge variant={getTypeVariant(providerType)}>{getProviderTypeLabel(providerType)}</Badge>
}
