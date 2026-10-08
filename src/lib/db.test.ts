import Dexie from 'dexie'
import { afterEach, describe, expect, it } from 'vitest'

import { db, PlannerDatabase } from './db'

describe('planner database', () => {
  afterEach(async () => {
    await db.open()
    for (const table of db.tables) await table.clear()
  })

  it('persists and retrieves cents-based transactions', async () => {
    await db.transactions.put({
      id: 501,
      type: 'expense',
      amountCents: 2499,
      category: 'Books',
      note: 'Planner',
      date: '2026-10-08',
    })

    expect(await db.transactions.get(501)).toMatchObject({ amountCents: 2499 })
  })

  it('upgrades legacy transactions without guessing ambiguous values', async () => {
    const name = `planner-migration-test-${Date.now()}`
    const legacyDatabase = new Dexie(name)
    legacyDatabase.version(1).stores({
      goals: '++id, title, category, status, targetDate',
      tasks: '++id, title, status, dueDate, category, list',
      events: '++id, title, start, category',
      journalEntries: '++id, date, title, mood',
      moodEntries: '++id, date, score',
      transactions: '++id, date, type, category',
      countdowns: '++id, date, category',
      preferences: '&id',
    })
    await legacyDatabase.open()
    await legacyDatabase.table('transactions').bulkPut([
      { id: 1, type: 'income', amount: 2600, category: 'Salary', note: 'Monthly paycheck', date: '2026-10-01' },
      { id: 501, type: 'expense', amount: 2499, category: 'Books', note: 'Planner', date: '2026-10-08' },
      { id: 502, type: 'expense', amount: 1234.5, category: 'Unknown', note: 'Review', date: '2026-10-08' },
    ])
    legacyDatabase.close()

    const upgradedDatabase = new PlannerDatabase(name)
    await upgradedDatabase.open()
    const starter = await upgradedDatabase.transactions.get(1)
    const oldAppTransaction = await upgradedDatabase.transactions.get(501)
    const ambiguous = await upgradedDatabase.transactions.get(502)

    expect(starter).toMatchObject({ amountCents: 260000, legacyAmount: 2600 })
    expect(oldAppTransaction).toMatchObject({ amountCents: 2499 })
    expect(ambiguous).toMatchObject({ amountCents: null, legacyAmount: 1234.5, unitNeedsReview: true })

    upgradedDatabase.close()
    await upgradedDatabase.delete()
  })
})