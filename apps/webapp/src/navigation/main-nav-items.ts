import {
  AlertTriangle,
  Building2,
  Download,
  Droplets,
  FlaskConical,
  Gauge,
  Home,
  type LucideIcon,
  Receipt,
  Settings,
  ShieldUser
} from 'lucide-react'
import { canAccessAdminPanel, isStaff, isWaterMeterReaderOnly } from '@/lib/user-roles'

export interface MainNavItem {
  title: string
  url: string
  icon: LucideIcon
  /** Shown in the fixed mobile bottom bar. At most 3 items set this. */
  primary?: boolean
}

const READER_ONLY_ITEMS: MainNavItem[] = [
  { title: 'Lecturas', url: '/water-meter/new', icon: Droplets, primary: true }
]

const STAFF_ITEMS: MainNavItem[] = [
  { title: 'Inicio', url: '/', icon: Home, primary: true },
  { title: 'Lecturas', url: '/water-meter/new', icon: Droplets, primary: true },
  { title: 'Contadores', url: '/water-meter', icon: Gauge },
  { title: 'Gestión', url: '/management', icon: Settings, primary: true },
  { title: 'Cobros', url: '/fees', icon: Receipt },
  { title: 'Proveedores', url: '/provider', icon: Building2 },
  { title: 'Incidencias', url: '/incident', icon: AlertTriangle },
  { title: 'Analíticas', url: '/analysis', icon: FlaskConical },
  { title: 'Exportar', url: '/export', icon: Download }
]

const ADMIN_ITEM: MainNavItem = { title: 'Admin', url: '/admin', icon: ShieldUser }

export function getMainNavItems(roles: string[]): MainNavItem[] {
  if (isWaterMeterReaderOnly(roles)) {
    return READER_ONLY_ITEMS
  }

  if (isStaff(roles)) {
    return canAccessAdminPanel(roles) ? [...STAFF_ITEMS, ADMIN_ITEM] : STAFF_ITEMS
  }

  return []
}

export function isNavItemActive(url: string, pathname: string): boolean {
  if (url === '/') {
    return pathname === '/'
  }

  return pathname === url || pathname.startsWith(`${url}/`)
}
