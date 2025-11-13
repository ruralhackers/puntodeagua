import {
  AlertTriangle,
  Building2,
  ChartBar,
  Download,
  Fingerprint,
  GlassWater,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  TestTube,
  Users
} from 'lucide-react'

export interface NavSubItem {
  title: string
  url: string
  icon?: LucideIcon
  comingSoon?: boolean
  newTab?: boolean
  isNew?: boolean
}

export interface NavMainItem {
  title: string
  url: string
  icon?: LucideIcon
  subItems?: NavSubItem[]
  comingSoon?: boolean
  newTab?: boolean
  isNew?: boolean
}

export interface NavGroup {
  id: number
  label?: string
  items: NavMainItem[]
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: 'Comunidad',
    items: [
      {
        title: 'Panel',
        url: '/admin',
        icon: LayoutDashboard
      },
      {
        title: 'Comunidades',
        url: '/admin/communities',
        icon: ChartBar
      },
      {
        title: 'Usuarios',
        url: '/admin/users',
        icon: Users
      }
    ]
  },
  {
    id: 2,
    label: 'Registros',
    items: [
      {
        title: 'Administrar puntos de agua',
        url: '/admin/water-points',
        icon: GlassWater
      },
      {
        title: 'Contadores',
        url: '/admin/water-meters',
        icon: Fingerprint
      },
      {
        title: 'Lecturas',
        url: '/water-meter/new',
        icon: Fingerprint,
        isNew: true
      },
      {
        title: 'Análisis',
        url: '/admin/analysis',
        icon: TestTube
      },
      {
        title: 'Incidencias',
        url: '/incidents',
        icon: AlertTriangle
      },
      {
        title: 'Proveedores',
        url: '/provider',
        icon: Building2
      },
      {
        title: 'Gestión',
        url: '/management',
        icon: Settings
      }
    ]
  },
  {
    id: 3,
    label: 'Herramientas',
    items: [
      {
        title: 'Exportar Datos',
        url: '/export',
        icon: Download
      }
    ]
  }
]
