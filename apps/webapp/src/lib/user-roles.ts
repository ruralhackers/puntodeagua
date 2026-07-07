const STAFF_ROLES = ['ADMIN', 'COMMUNITY_ADMIN', 'MANAGER'] as const

export function isStaff(roles: string[]): boolean {
  return roles.some((role) => STAFF_ROLES.includes(role as (typeof STAFF_ROLES)[number]))
}

export function isWaterMeterReaderOnly(roles: string[]): boolean {
  return roles.includes('WATER_METER_READER') && !isStaff(roles)
}

export function isAdmin(roles: string[]): boolean {
  return roles.includes('ADMIN')
}

export function isCommunityAdmin(roles: string[]): boolean {
  return roles.includes('COMMUNITY_ADMIN')
}

export function canAccessAdminPanel(roles: string[]): boolean {
  return isAdmin(roles) || isCommunityAdmin(roles)
}
