import { describe, expect, it } from 'bun:test'
import { filterAndRankMeters } from './water-meter-search'

const meter = (
  waterAccountName: string,
  connectionNumber: string | null,
  location = 'Mondariz'
) => ({
  waterAccountName,
  waterPoint: { name: `Casa ${waterAccountName}`, location, connectionNumber }
})

describe('filterAndRankMeters', () => {
  it('returns every meter when the query is empty', () => {
    const meters = [meter('Ana', '1'), meter('Bea', '2')]

    expect(filterAndRankMeters(meters, '   ')).toEqual(meters)
  })

  it('keeps partial matches on the connection number', () => {
    const meters = [meter('Ana', '142'), meter('Bea', '42')]

    expect(filterAndRankMeters(meters, '42')).toHaveLength(2)
  })

  it('puts the exact connection number first', () => {
    const meters = [meter('Ana', '142'), meter('Bea', '420'), meter('Cé', '42')]

    expect(filterAndRankMeters(meters, '42').map((m) => m.waterAccountName)).toEqual([
      'Cé',
      'Ana',
      'Bea'
    ])
  })

  it('matches the account name, the point name and the location, case-insensitively', () => {
    const meters = [meter('Ana', '1', 'Rúa do Muíño'), meter('Bea', '2', 'Landín')]

    expect(filterAndRankMeters(meters, 'muíÑo').map((m) => m.waterAccountName)).toEqual(['Ana'])
    expect(filterAndRankMeters(meters, 'bea').map((m) => m.waterAccountName)).toEqual(['Bea'])
    expect(filterAndRankMeters(meters, 'casa ana').map((m) => m.waterAccountName)).toEqual(['Ana'])
  })

  it('drops meters that match nothing', () => {
    expect(filterAndRankMeters([meter('Ana', '1')], 'zzz')).toEqual([])
  })

  it('tolerates a missing connection number', () => {
    expect(filterAndRankMeters([meter('Ana', null)], 'ana')).toHaveLength(1)
  })
})
