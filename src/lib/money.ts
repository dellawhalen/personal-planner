import { defaultTransactions } from './defaults'
import type { BudgetTransaction } from '../types'

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function parseCurrencyToCents(value: string): number | null {
  const normalized = value.trim()
  if (!/^\d+(?:\.\d{0,2})?$/.test(normalized)) return null

  const [wholePart, fractionalPart = ''] = normalized.split('.')
  const cents = Number(wholePart) * 100 + Number(fractionalPart.padEnd(2, '0'))
  return Number.isSafeInteger(cents) ? cents : null
}

export function formatCurrency(cents: number): string {
  if (!Number.isSafeInteger(cents)) throw new TypeError('Currency values must be integer cents.')
  return usdFormatter.format(cents / 100)
}

export function calculateBudgetTotals(transactions: BudgetTransaction[], month?: string) {
  return transactions.reduce(
    (totals, transaction) => {
      if (transaction.amountCents === null || !Number.isSafeInteger(transaction.amountCents)) return totals
      if (month && !transaction.date.startsWith(month)) return totals

      if (transaction.type === 'income') totals.incomeCents += transaction.amountCents
      else totals.expenseCents += transaction.amountCents

      return totals
    },
    { incomeCents: 0, expenseCents: 0, remainingCents: 0 },
  )
}

export function withBudgetRemaining<T extends { incomeCents: number; expenseCents: number }>(totals: T) {
  return { ...totals, remainingCents: totals.incomeCents - totals.expenseCents }
}

export function normalizeLegacyBudgetTransaction(value: unknown): BudgetTransaction {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Transaction record must be an object.')
  }

  const record = value as Record<string, unknown>
  if (Number.isSafeInteger(record.amountCents) && Number(record.amountCents) >= 0) {
    return record as unknown as BudgetTransaction
  }

  if (record.amountCents === null && record.unitNeedsReview === true && typeof record.legacyAmount === 'number') {
    return record as unknown as BudgetTransaction
  }

  if (typeof record.amount !== 'number' || !Number.isFinite(record.amount)) {
    throw new TypeError('Transaction amount is missing or invalid.')
  }

  const starter = defaultTransactions.find((candidate) =>
    candidate.id === record.id &&
    candidate.type === record.type &&
    candidate.category === record.category &&
    candidate.note === record.note &&
    candidate.date === record.date &&
    candidate.amountCents !== null && candidate.amountCents / 100 === record.amount,
  )
  const { amount, ...rest } = record

  if (starter) {
    return { ...rest, amountCents: starter.amountCents, legacyAmount: amount } as unknown as BudgetTransaction
  }

  if (Number.isSafeInteger(amount) && amount >= 0) {
    return { ...rest, amountCents: amount } as unknown as BudgetTransaction
  }

  return {
    ...rest,
    amountCents: null,
    legacyAmount: amount,
    unitNeedsReview: true,
  } as unknown as BudgetTransaction
}