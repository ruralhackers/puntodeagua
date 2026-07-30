import { describe, expect, it } from 'bun:test'
import { getActiveNavUrl, getMainNavItems, isNavItemActive } from './main-nav-items'

describe('getMainNavItems', () => {
  it('gives staff the full set of destinations', () => {
    const urls = getMainNavItems(['MANAGER']).map((item) => item.url)
    expect(urls).toEqual([
      '/',
      '/water-meter/new',
      '/water-meter',
      '/management',
      '/fees',
      '/provider',
      '/incident',
      '/analysis',
      '/export'
    ])
  })

  it('gives reader-only users just the reading flow', () => {
    const urls = getMainNavItems(['WATER_METER_READER']).map((item) => item.url)
    expect(urls).toEqual(['/water-meter/new'])
  })

  it('treats a reader who is also staff as staff', () => {
    const urls = getMainNavItems(['WATER_METER_READER', 'MANAGER']).map((item) => item.url)
    expect(urls).toContain('/management')
  })

  it('exposes the admin panel only to ADMIN', () => {
    expect(getMainNavItems(['ADMIN']).map((i) => i.url)).toContain('/admin')
    expect(getMainNavItems(['COMMUNITY_ADMIN']).map((i) => i.url)).not.toContain('/admin')
  })

  it('marks at most three items as primary for the bottom bar', () => {
    const primary = getMainNavItems(['MANAGER']).filter((item) => item.primary)
    expect(primary.length).toBeLessThanOrEqual(3)
    expect(primary.map((item) => item.url)).toEqual(['/', '/water-meter/new', '/management'])
  })

  it('never offers a reader-only user a route the middleware would reject', () => {
    // Mirrors WATER_METER_READER_ALLOWED_PATHS in lib/water-meter-reader-paths.ts
    const allowed = ['/water-meter/new', '/unauthorized', '/privacy', '/terms']
    for (const item of getMainNavItems(['WATER_METER_READER'])) {
      expect(allowed).toContain(item.url)
    }
  })

  it('gives an empty role list no destinations', () => {
    expect(getMainNavItems([])).toEqual([])
  })

  it('gives an unrecognized role no destinations', () => {
    expect(getMainNavItems(['SOME_UNKNOWN_ROLE'])).toEqual([])
  })
})

describe('isNavItemActive', () => {
  it('matches the home route exactly and nothing else', () => {
    expect(isNavItemActive('/', '/')).toBe(true)
    expect(isNavItemActive('/', '/management')).toBe(false)
    expect(isNavItemActive('/', '/water-meter')).toBe(false)
  })

  it('matches a section and its descendants', () => {
    expect(isNavItemActive('/management', '/management')).toBe(true)
    expect(isNavItemActive('/management', '/management/deposits')).toBe(true)
    expect(isNavItemActive('/fees', '/fees/new/abc')).toBe(true)
  })

  it('does not match a different section with a shared prefix', () => {
    expect(isNavItemActive('/water-meter', '/water-meters-report')).toBe(false)
    expect(isNavItemActive('/provider', '/providers')).toBe(false)
  })

  it('marks both a section and its child route as active', () => {
    expect(isNavItemActive('/water-meter/new', '/water-meter/new')).toBe(true)
    expect(isNavItemActive('/water-meter', '/water-meter/new')).toBe(true)
  })
})

describe('getActiveNavUrl', () => {
  const items = getMainNavItems(['MANAGER'])

  it('picks the more specific descendant over its ancestor', () => {
    expect(getActiveNavUrl(items, '/water-meter/new')).toBe('/water-meter/new')
  })

  it('picks the section itself when visiting it directly', () => {
    expect(getActiveNavUrl(items, '/water-meter')).toBe('/water-meter')
  })

  it('picks the section for one of its descendants', () => {
    expect(getActiveNavUrl(items, '/management/deposits')).toBe('/management')
  })

  it('picks the home route only for an exact match', () => {
    expect(getActiveNavUrl(items, '/')).toBe('/')
  })

  it('returns null when nothing matches', () => {
    expect(getActiveNavUrl(items, '/privacy')).toBeNull()
  })
})
