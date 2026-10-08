import { describe, expect, it } from 'vitest'

import { defaultTransactions } from './defaults'
import {
  calculateBudgetTotals,
  formatCurrency,
  normalizeLegacyBudgetTransaction,
  parseCurrencyToCents,
  withBudgetRemaining,
} from './money'

describe('money utilities', () => {
  it('parses decimal currency into integer cents', () => {
    expect(parseCurrencyToCents('12')).toBe(1200)
    expect(parseCurrencyToCents('12.3')).toBe(1230)
    expect(parseCurrencyToCents('12.34')).toBe(1234)
    expect(parseCurrencyToCents('12.345')).toBeNull()
  })

  it('formats integer cents as USD', () => {
    expect(formatCurrency(123456)).toBe('$1,234.56')
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('calculates income, expenses, remaining, and optional month totals', () => {
    const transactions = [
      { id: 1, type: 'income' as const, amountCents: 120000, category: 'Pay', note: '', date: '2026-10-01' },
      { id: 2, type: 'expense' as const, amountCents: 2350, category: 'Food', note: '', date: '2026-10-03' },
      { id: 3, type: 'income' as const, amountCents: 50000, category: 'Pay', note: '', date: '2026-09-30' },
      { id: 4, type: 'expense' as const, amountCents: null, unitNeedsReview: true, legacyAmount: 17, category: 'Unknown', note: '', date: '2026-10-04' },
    ]

    expect(withBudgetRemaining(calculateBudgetTotals(transactions, '2026-10'))).toEqual({
      incomeCents: 120000,
      expenseCents: 2350,
      remainingCents: 117650,
    })
  })

  it('converts only exact legacy starter records and preserves their original values', () => {
    const { amountCents, ...starter } = defaultTransactions[0]
    const legacyStarter = {
      ...starter,
      amount: (amountCents ?? 0) / 100,
    }

    expect(normalizeLegacyBudgetTransaction(legacyStarter)).toMatchObject({
      amountCents: 260000,
      legacyAmount: 2600,
    })
  })

  it('preserves ambiguous fractional legacy values for explicit review', () => {
    const legacyRecord = {
      id: 100,
      type: 'expense',
      amount: 1234.5,
      category: 'Old record',
      note: 'Imported',
      date: '2026-10-01',
    }

    expect(normalizeLegacyBudgetTransaction(legacyRecord)).toMatchObject({
      amountCents: null,
      legacyAmount: 1234.5,
      unitNeedsReview: true,
    })
  })
})