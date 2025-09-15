import {
  Banknote,
  ChartBar,
  Fingerprint,
  GlassWater,
  LayoutDashboard,
  type LucideIcon,
  SquareArrowUpRight,
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
    label: 'Community',
    items: [
      {
        title: 'Dashboard',
        url: '/admin',
        icon: LayoutDashboard
      },
      {
        title: 'Communities',
        url: '/admin/communities',
        icon: ChartBar
      },
      {
        title: 'Users',
        url: '/admin/users',
        icon: Users
      }
    ]
  },
  {
    id: 2,
    label: 'Registers',
    items: [
      {
        title: 'Water Points',
        url: '/admin/water-points',
        icon: GlassWater
      },
      {
        title: 'Water Meters',
        url: '/admin/water-meters',
        icon: Fingerprint
      }
    ]
  }
]
