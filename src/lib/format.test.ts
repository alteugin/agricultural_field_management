import { describe, expect, it } from 'vitest'
import { formatArea, formatDateTime, formatLatLng } from './format'

describe('formatArea', () => {
  it('uses Ukrainian decimal comma and one decimal place', () => {
    // Intl may use a narrow no-break space as the group separator
    expect(formatArea(74.2345).replace(/\s/g, ' ')).toBe('74,2 га')
    expect(formatArea(1234).replace(/\s/g, ' ')).toBe('1 234,0 га')
  })
})

describe('formatLatLng', () => {
  it('prints lat, lng with 6 decimals', () => {
    expect(formatLatLng(49.6123456789, 30.27)).toBe('49.612346, 30.270000')
  })
})

describe('formatDateTime', () => {
  it('formats a valid ISO date', () => {
    expect(formatDateTime('2026-10-09T09:05:00.000Z')).toMatch(/09\.10\.2026/)
  })

  it('does not throw on an invalid date', () => {
    expect(formatDateTime('not a date')).toBe('—')
  })
})
