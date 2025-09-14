import {
  Banknote,
  ChartBar,
  Fingerprint,
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
    label: 'Dashboards',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard
      },
      {
        title: 'Default',
        url: '/dashboard/default',
        icon: Fingerprint
      },
      {
        title: 'CRM',
        url: '/dashboard/crm',
        icon: ChartBar
      },
      {
        title: 'Finance',
        url: '/dashboard/finance',
        icon: Banknote
      }
    ]
  },
  {
    id: 2,
    label: 'Pages',
    items: [
      {
        title: 'Users',
        url: '/dashboard/users',
        icon: Users
      }
    ]
  },
  {
    id: 3,
    label: 'Misc',
    items: [
      {
        title: 'Others',
        url: '/dashboard/coming-soon',
        icon: SquareArrowUpRight,
        comingSoon: true
      }
    ]
  }
]
