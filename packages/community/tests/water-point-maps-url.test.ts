import { describe, expect, it } from 'bun:test'
import { Id } from '@pda/common/domain'
import { WaterPoint } from '../domain'

const baseDto = {
  name: 'Casa do Muíño',
  location: '42.2286,-8.4589',
  fixedPopulation: 3,
  floatingPopulation: 0,
  cadastralReference: 'CAD-1',
  communityZoneId: Id.generateUniqueId().toString(),
  waterDepositIds: []
}

describe('WaterPoint mapsUrl', () => {
  it('round-trips a maps url through fromDto/toDto', () => {
    const dto = {
      ...baseDto,
      id: Id.generateUniqueId().toString(),
      mapsUrl: 'https://maps.app.goo.gl/aBc123'
    }

    expect(WaterPoint.fromDto(dto).toDto().mapsUrl).toBe('https://maps.app.goo.gl/aBc123')
  })

  it('keeps mapsUrl undefined when it was never set', () => {
    const dto = { ...baseDto, id: Id.generateUniqueId().toString() }

    expect(WaterPoint.fromDto(dto).toDto().mapsUrl).toBeUndefined()
  })

  it('carries mapsUrl through create', () => {
    const waterPoint = WaterPoint.create({ ...baseDto, mapsUrl: 'https://maps.app.goo.gl/xYz' })

    expect(waterPoint.mapsUrl).toBe('https://maps.app.goo.gl/xYz')
  })
})
