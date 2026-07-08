export const WATER_METER_READER_ALLOWED_PATHS = [
  '/water-meter/new',
  '/unauthorized',
  '/privacy',
  '/terms'
]

export function isPathAllowedForWaterMeterReader(pathname: string): boolean {
  if (
    WATER_METER_READER_ALLOWED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
  ) {
    return true
  }

  // Allow /water-meter/[id] detail pages but not /water-meter (staff list)
  return /^\/water-meter\/[^/]+$/.test(pathname)
}
