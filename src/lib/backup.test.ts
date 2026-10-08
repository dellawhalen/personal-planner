import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { db } from './db'
import { defaultPreferences } from './defaults'
import { createPlannerBackup, restorePlannerBackup, validatePlannerBackup } from './backup'

function makeBackup(overrides: Partial<Parameters<typeof createPlannerBackup>[0]> = {}) {
  return createPlannerBackup({
    goals: [],
    tasks: [],
    events: [],
    journalEntries: [],
    moodEntries: [],
    transactions: [],
    countdowns: [],
    preferences: defaultPreferences,
    ...overrides,
  }, '2026-10-08T12:00:00.000Z')
}

async function clearPlannerData() {
  await db.open()
  for (const table of db.tables) await table.clear()
}

describe('planner backup service', () => {
  beforeEach(clearPlannerData)

  afterEach(async () => {
    vi.restoreAllMocks()
    await clearPlannerData()
  })

  it('creates a versioned export and preserves uploaded asset fields on restore', async () => {
    const backup = makeBackup({
      journalEntries: [{ id: 8, title: 'Memory', content: 'A day to keep', date: '2026-10-08', tags: [], image: 'data:image/png;base64,AAAA' }],
      transactions: [{ id: 9, type: 'expense', amountCents: 375, category: 'Tea', note: '', date: '2026-10-08' }],
    })

    expect(backup.backupVersion).toBe(2)
    await restorePlannerBackup(backup)

    expect(await db.journalEntries.get(8)).toMatchObject({ image: 'data:image/png;base64,AAAA' })
    expect(await db.transactions.get(9)).toMatchObject({ amountCents: 375 })
  })

  it('rejects an invalid complete backup before changing existing records', async () => {
    await db.goals.put({
      id: 17,
      title: 'Keep me',
      description: '',
      category: 'This month',
      priority: 'medium',
      targetDate: '',
      status: 'not_started',
      progress: 0,
      milestones: [],
      subtasks: [],
      completedMilestones: [],
      completedSubtasks: [],
      notes: '',
      associatedTaskIds: [],
    })
    const invalid = { ...makeBackup(), tasks: [{ id: 'not-an-id' }] }

    await expect(restorePlannerBackup(invalid)).rejects.toThrow('Backup validation failed')
    expect(await db.goals.get(17)).toMatchObject({ title: 'Keep me' })
  })

  it('rolls back every table if a write fails during restoration', async () => {
    await db.goals.put({
      id: 21,
      title: 'Existing goal',
      description: '',
      category: 'This month',
      priority: 'medium',
      targetDate: '',
      status: 'not_started',
      progress: 0,
      milestones: [],
      subtasks: [],
      completedMilestones: [],
      completedSubtasks: [],
      notes: '',
      associatedTaskIds: [],
    })
    vi.spyOn(db.tasks, 'bulkPut').mockRejectedValueOnce(new Error('simulated write failure'))

    await expect(restorePlannerBackup(makeBackup())).rejects.toThrow('simulated write failure')
    expect(await db.goals.get(21)).toMatchObject({ title: 'Existing goal' })
  })

  it('normalizes recognized legacy backups and flags ambiguous amounts', () => {
    const legacy = {
      ...makeBackup(),
      backupVersion: undefined,
      preferences: { greeting: 'A saved older greeting' },
      transactions: [
        { id: 1, type: 'income', amount: 2600, category: 'Salary', note: 'Monthly paycheck', date: '2026-10-01' },
        { id: 400, type: 'expense', amount: 1234.5, category: 'Unknown units', note: 'Keep original', date: '2026-10-02' },
      ],
    }
    const parsed = validatePlannerBackup(legacy)

    expect(parsed.transactions[0]).toMatchObject({ amountCents: 260000, legacyAmount: 2600 })
    expect(parsed.transactions[1]).toMatchObject({ amountCents: null, legacyAmount: 1234.5, unitNeedsReview: true })
    expect(parsed.preferences).toMatchObject({ siteName: defaultPreferences.siteName, greeting: 'A saved older greeting' })
  })
})