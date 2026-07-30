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

/**
 * `isNavItemActive` is pairwise: it has no visibility into sibling items, so two
 * ancestor/descendant routes (e.g. `/water-meter` and `/water-meter/new`) can both
 * report active for the same pathname. Callers that render the full nav list at once
 * (unlike the bottom bar, which only shows `primary` items) need a single winner.
 * Among all matching items, the one with the longest `url` is the most specific.
 */
export function getActiveNavUrl(items: MainNavItem[], pathname: string): string | null {
  let best: string | null = null

  for (const item of items) {
    if (!isNavItemActive(item.url, pathname)) continue
    if (best === null || item.url.length > best.length) {
      best = item.url
    }
  }

  return best
}
