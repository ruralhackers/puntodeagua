import { format } from 'date-fns'

/**
 * Formats a Date as YYYY-MM-DD in the runtime's local timezone.
 *
 * Replaces `toISOString().split('T')[0]`, which returns the UTC day: in Spain
 * (UTC+1/+2) that is still yesterday between local midnight and 01:00/02:00,
 * so a reading taken then was dated a day early and today could not even be
 * selected where the value was used as an input's `max`.
 */
export function toLocalDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Today as YYYY-MM-DD in local time. */
export function todayLocalDateString(): string {
  return toLocalDateString(new Date())
}
