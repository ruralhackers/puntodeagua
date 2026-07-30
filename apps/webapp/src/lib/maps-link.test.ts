import { describe, expect, it } from 'bun:test'
import { buildMapsHref } from './maps-link'

describe('buildMapsHref', () => {
  it('returns a pasted Google Maps link untouched', () => {
    expect(buildMapsHref('https://maps.app.goo.gl/aBc123')).toBe('https://maps.app.goo.gl/aBc123')
  })

  it('accepts plain http links', () => {
    expect(buildMapsHref('http://www.google.com/maps?q=42,-8')).toBe(
      'http://www.google.com/maps?q=42,-8'
    )
  })

  it('trims surrounding whitespace', () => {
    expect(buildMapsHref('  https://maps.app.goo.gl/aBc123  ')).toBe(
      'https://maps.app.goo.gl/aBc123'
    )
  })

  it('turns "lat,lng" coordinates into a Google Maps search', () => {
    expect(buildMapsHref('42.2286,-8.4589')).toBe(
      'https://www.google.com/maps/search/?api=1&query=42.2286,-8.4589'
    )
  })

  it('accepts coordinates with a space after the comma', () => {
    expect(buildMapsHref('42.2286, -8.4589')).toBe(
      'https://www.google.com/maps/search/?api=1&query=42.2286,-8.4589'
    )
  })

  it('rejects out-of-range coordinates', () => {
    expect(buildMapsHref('95,200')).toBeNull()
  })

  it('rejects the "0,0" placeholder legacy rows carry', () => {
    expect(buildMapsHref('0,0')).toBeNull()
  })

  it('rejects free-form addresses: we do not geocode', () => {
    expect(buildMapsHref('Rúa do Muíño 3, Mondariz')).toBeNull()
  })

  it('rejects non-http schemes so the href can never execute script', () => {
    expect(buildMapsHref('javascript:alert(1)')).toBeNull()
    expect(buildMapsHref('data:text/html,<script>alert(1)</script>')).toBeNull()
  })

  it('returns null for empty and missing values', () => {
    expect(buildMapsHref('')).toBeNull()
    expect(buildMapsHref('   ')).toBeNull()
    expect(buildMapsHref(null)).toBeNull()
    expect(buildMapsHref(undefined)).toBeNull()
  })
})
