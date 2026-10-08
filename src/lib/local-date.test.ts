import { describe, expect, it } from 'vitest'

import {
  formatLocalDate,
  formatLocalDateLabel,
  formatLocalDateTimeInput,
  getLocalMonthKey,
  parseLocalDate,
  parseLocalDateTime,
} from './local-date'

describe('local date utilities', () => {
  it('formats dates and datetime-local values from local calendar fields', () => {
    const localDate = new Date(2026, 9, 8, 23, 59)
    expect(formatLocalDate(localDate)).toBe('2026-10-08')
    expect(formatLocalDateTimeInput(localDate)).toBe('2026-10-08T23:59')
    expect(getLocalMonthKey(localDate)).toBe('2026-10')
  })

  it('parses date-only values without interpreting them as UTC', () => {
    const date = parseLocalDate('2026-01-01')
    expect(date).not.toBeNull()
    expect(formatLocalDate(date!)).toBe('2026-01-01')
    expect(formatLocalDateLabel('2026-01-01', { year: 'numeric', month: 'long', day: 'numeric' })).toBe('January 1, 2026')
  })

  it('keeps local scheduling inputs on the selected date around DST boundaries', () => {
    const beforeSpringTransition = parseLocalDateTime('2026-03-08', '00:15')
    const afterAutumnTransition = parseLocalDateTime('2026-11-01', '23:45')

    expect(beforeSpringTransition).not.toBeNull()
    expect(formatLocalDateTimeInput(beforeSpringTransition!)).toBe('2026-03-08T00:15')
    expect(afterAutumnTransition).not.toBeNull()
    expect(formatLocalDateTimeInput(afterAutumnTransition!)).toBe('2026-11-01T23:45')
  })

  it('rejects malformed or impossible calendar values', () => {
    expect(parseLocalDate('2026-02-30')).toBeNull()
    expect(parseLocalDateTime('2026-10-08', '24:00')).toBeNull()
  })
})