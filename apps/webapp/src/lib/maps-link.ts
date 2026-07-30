// Matches "lat,lng" with an optional space after the comma.
const COORDINATES_PATTERN = /^(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/

/**
 * Turns whatever the community typed into a safe map href, or null when there
 * is nothing usable. Accepts a pasted http(s) link (Google Maps short links
 * included) or bare "lat,lng" coordinates. Everything else is rejected: the
 * value is free text a user pasted, and it ends up in an href.
 */
export function buildMapsHref(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null

  const coordinates = COORDINATES_PATTERN.exec(trimmed)
  if (coordinates) {
    const latitude = Number(coordinates[1])
    const longitude = Number(coordinates[2])
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
    // Null island: the placeholder legacy rows and fixtures carry, not a place.
    if (latitude === 0 && longitude === 0) return null
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
  }

  if (/^https?:\/\//i.test(trimmed)) return trimmed

  return null
}
