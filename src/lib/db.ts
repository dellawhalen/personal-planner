import Dexie, { type Table } from 'dexie'

import type {
  AppPreferences,
  BudgetTransaction,
  CalendarEventItem,
  Countdown,
  Goal,
  JournalEntry,
  MoodEntry,
  Task,
} from '../types'
import {
  defaultCountdowns,
  defaultEvents,
  defaultGoals,
  defaultJournalEntries,
  defaultMoodEntries,
  defaultPreferences,
  defaultTasks,
  defaultTransactions,
} from './defaults'

class PlannerDatabase extends Dexie {
  goals!: Table<Goal, number>
  tasks!: Table<Task, number>
  events!: Table<CalendarEventItem, number>
  journalEntries!: Table<JournalEntry, number>
  moodEntries!: Table<MoodEntry, number>
  transactions!: Table<BudgetTransaction, number>
  countdowns!: Table<Countdown, number>
  preferences!: Table<AppPreferences & { id: string }, string>

  constructor() {
    super('a-life-in-bloom-db')
    this.version(1).stores({
      goals: '++id, title, category, status, targetDate',
      tasks: '++id, title, status, dueDate, category, list',
      events: '++id, title, start, category',
      journalEntries: '++id, date, title, mood',
      moodEntries: '++id, date, score',
      transactions: '++id, date, type, category',
      countdowns: '++id, date, category',
      preferences: '&id',
    })
  }
}

export const db = new PlannerDatabase()

export async function seedDatabase() {
  const hasGoals = (await db.goals.count()) > 0
  const hasTasks = (await db.tasks.count()) > 0
  const hasEvents = (await db.events.count()) > 0
  const hasJournalEntries = (await db.journalEntries.count()) > 0
  const hasMoodEntries = (await db.moodEntries.count()) > 0
  const hasTransactions = (await db.transactions.count()) > 0
  const hasCountdowns = (await db.countdowns.count()) > 0
  const hasPreferences = (await db.preferences.get('settings')) !== undefined

  if (!hasGoals) {
    await db.goals.bulkAdd(defaultGoals)
  }
  if (!hasTasks) {
    await db.tasks.bulkAdd(defaultTasks)
  }
  if (!hasEvents) {
    await db.events.bulkAdd(defaultEvents)
  }
  if (!hasJournalEntries) {
    await db.journalEntries.bulkAdd(defaultJournalEntries)
  }
  if (!hasMoodEntries) {
    await db.moodEntries.bulkAdd(defaultMoodEntries)
  }
  if (!hasTransactions) {
    await db.transactions.bulkAdd(defaultTransactions)
  }
  if (!hasCountdowns) {
    await db.countdowns.bulkAdd(defaultCountdowns)
  }
  if (!hasPreferences) {
    await db.preferences.put({ ...defaultPreferences, id: 'settings' })
  }
}

export async function resetDatabase() {
  await db.goals.clear()
  await db.tasks.clear()
  await db.events.clear()
  await db.journalEntries.clear()
  await db.moodEntries.clear()
  await db.transactions.clear()
  await db.countdowns.clear()
  await db.preferences.clear()
  await seedDatabase()
}
