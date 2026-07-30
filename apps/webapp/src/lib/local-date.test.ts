// Pin the timezone so this suite is deterministic wherever it runs, including
// a CI box on UTC. Verified: this assignment takes effect in bun and overrides
// an inherited TZ, so the UTC-vs-local contrast below is always exercised.
process.env.TZ = 'Europe/Madrid'

import { describe, expect, it } from 'bun:test'
import { todayLocalDateString, toLocalDateString } from './local-date'

describe('toLocalDateString', () => {
  it('returns the local calendar day, not the UTC one', () => {
    // 00:30 local on 30 July in Madrid (UTC+2) is still 29 July in UTC.
    // `toISOString().split('T')[0]` returned the 29th — that was the bug.
    const justAfterLocalMidnight = new Date(2026, 6, 30, 0, 30)

    expect(justAfterLocalMidnight.toISOString().split('T')[0]).toBe('2026-07-29')
    expect(toLocalDateString(justAfterLocalMidnight)).toBe('2026-07-30')
  })

  it('handles a winter date, when Madrid is UTC+1', () => {
    const justAfterLocalMidnight = new Date(2026, 0, 15, 0, 30)

    expect(justAfterLocalMidnight.toISOString().split('T')[0]).toBe('2026-01-14')
    expect(toLocalDateString(justAfterLocalMidnight)).toBe('2026-01-15')
  })

  it('agrees with UTC during the middle of the day', () => {
    expect(toLocalDateString(new Date(2026, 6, 30, 12, 0))).toBe('2026-07-30')
  })

  it('zero-pads month and day', () => {
    expect(toLocalDateString(new Date(2026, 0, 5, 9, 0))).toBe('2026-01-05')
  })

  it('handles the last instant of a local day', () => {
    expect(toLocalDateString(new Date(2026, 6, 30, 23, 59, 59))).toBe('2026-07-30')
  })
})

describe('todayLocalDateString', () => {
  it('matches toLocalDateString for now', () => {
    expect(todayLocalDateString()).toBe(toLocalDateString(new Date()))
  })

  it('is a valid YYYY-MM-DD string', () => {
    expect(todayLocalDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
