import { z } from 'zod'

/**
 * Object form (useful internally)
 */
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  long: z.number().min(-180).max(180)
})

export type LocationSchema = z.infer<typeof locationSchema>

/**
 * String form: "lat,long"
 * - Allows optional surrounding spaces
 * - Disallows extra spaces inside (normalize first if you want)
 * - Validates numeric ranges
 */
export const locationSchema = z
  .string()
  .trim()
  .refine(
    (value) => {
      const parts = value.split(',')
      if (parts.length !== 2) return false
      const [latStr, longStr] = parts.map((p) => p.trim())
      if (latStr === '' || longStr === '') return false
      const lat = Number(latStr)
      const long = Number(longStr)
      if (!Number.isFinite(lat) || !Number.isFinite(long)) return false
      if (lat < -90 || lat > 90) return false
      if (long < -180 || long > 180) return false
      return true
    },
    {
      message: 'Location must be "lat,long" with lat in [-90,90] and long in [-180,180]'
    }
  )

/**
 * Helper to parse and get structured coordinates.
 */
export function parseLocation(value: unknown) {
  const str = locationSchema.parse(value)
  const [latStr, longStr] = str.split(',').map((s) => s.trim())
  return {
    lat: Number(latStr),
    long: Number(longStr)
  }
}

/**
 * Optional combined schema that returns structured data directly.
 */
export const locationAsObjectSchema = locationSchema.transform((str) => {
  const [latStr, longStr] = str.split(',').map((s) => s.trim())
  return {
    lat: Number(latStr),
    long: Number(longStr)
  }
})
export type Coordinates = z.infer<typeof coordinatesSchema>
