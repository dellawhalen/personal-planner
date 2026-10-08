import { z } from 'zod'

import { defaultPreferences } from './defaults'
import { db, type PlannerDatabase } from './db'
import { normalizeLegacyBudgetTransaction } from './money'
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

const goalSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['Today', 'This week', 'This month', 'This year', 'Next five years', 'Someday']),
  priority: z.enum(['low', 'medium', 'high']),
  targetDate: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'archived']),
  progress: z.number().min(0).max(100),
  milestones: z.array(z.string()),
  subtasks: z.array(z.string()),
  completedMilestones: z.array(z.string()),
  completedSubtasks: z.array(z.string()),
  notes: z.string(),
  associatedTaskIds: z.array(z.number().int()),
}).passthrough()

const taskSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string(),
  dueTime: z.string().optional(),
  tags: z.array(z.string()),
  status: z.enum(['pending', 'completed']),
  completed: z.boolean(),
  goalId: z.number().int().optional(),
  list: z.enum(['daily', 'weekly', 'custom']),
  order: z.number().int().optional(),
}).passthrough()

const eventSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  start: z.string(),
  end: z.string().optional(),
  allDay: z.boolean(),
  category: z.string(),
  notes: z.string().optional(),
  location: z.string().optional(),
  goalId: z.number().int().optional(),
  taskId: z.number().int().optional(),
}).passthrough()

const journalSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  content: z.string(),
  date: z.string(),
  tags: z.array(z.string()),
  mood: z.number().optional(),
  image: z.string().optional(),
}).passthrough()

const moodSchema = z.object({
  id: z.number().int(),
  date: z.string(),
  score: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  note: z.string().optional(),
  tags: z.array(z.string()),
}).passthrough()

const currentTransactionSchema = z.object({
  id: z.number().int(),
  type: z.enum(['income', 'expense']),
  amountCents: z.number().int().nonnegative().nullable(),
  legacyAmount: z.number().optional(),
  unitNeedsReview: z.boolean().optional(),
  category: z.string(),
  note: z.string(),
  date: z.string(),
}).passthrough().superRefine((transaction, context) => {
  if (transaction.amountCents === null && (!transaction.unitNeedsReview || transaction.legacyAmount === undefined)) {
    context.addIssue({ code: 'custom', message: 'Unresolved transactions must preserve the original value and require review.' })
  }
})

const legacyTransactionSchema = z.object({
  id: z.number().int(),
  type: z.enum(['income', 'expense']),
  amount: z.number().finite(),
  category: z.string(),
  note: z.string(),
  date: z.string(),
}).passthrough()

const countdownSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  date: z.string(),
  time: z.string().optional(),
  category: z.string(),
  accent: z.string(),
  notes: z.string().optional(),
  image: z.string().optional(),
}).passthrough()

const preferencesSchema = z.object({
  siteName: z.string().optional(),
  greeting: z.string().optional(),
  accent: z.string().optional(),
  layoutPreset: z.enum(['balanced', 'productivity', 'dreamy']).optional(),
  animationLevel: z.number().optional(),
  showDecorativeElements: z.boolean().optional(),
  dashboardWidgets: z.array(z.string()).optional(),
  dashboardLayout: z.array(z.object({
    id: z.string(),
    title: z.string(),
    visible: z.boolean(),
    size: z.number(),
  }).passthrough()).optional(),
  exportVersion: z.number().int().optional(),
}).passthrough()

const sharedBackupSchema = z.object({
  exportedAt: z.string().min(1),
  goals: z.array(goalSchema),
  tasks: z.array(taskSchema),
  events: z.array(eventSchema),
  journalEntries: z.array(journalSchema),
  moodEntries: z.array(moodSchema),
  countdowns: z.array(countdownSchema),
  preferences: preferencesSchema,
}).passthrough()

const currentBackupSchema = sharedBackupSchema.extend({
  backupVersion: z.literal(2),
  transactions: z.array(currentTransactionSchema),
})

const legacyBackupSchema = sharedBackupSchema.extend({
  backupVersion: z.union([z.literal(1), z.undefined()]),
  transactions: z.array(z.union([currentTransactionSchema, legacyTransactionSchema])),
})

export interface PlannerBackup {
  backupVersion: 2
  exportedAt: string
  goals: Goal[]
  tasks: Task[]
  events: CalendarEventItem[]
  journalEntries: JournalEntry[]
  moodEntries: MoodEntry[]
  transactions: BudgetTransaction[]
  countdowns: Countdown[]
  preferences: AppPreferences
}

export type PlannerBackupData = Omit<PlannerBackup, 'backupVersion' | 'exportedAt'>

export function createPlannerBackup(data: PlannerBackupData, exportedAt = new Date().toISOString()): PlannerBackup {
  return { ...data, backupVersion: 2, exportedAt }
}

export function validatePlannerBackup(value: unknown): PlannerBackup {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Backup must be a JSON object.')
  }

  const version = (value as { backupVersion?: unknown }).backupVersion
  const result = version === 2
    ? currentBackupSchema.safeParse(value)
    : version === undefined || version === 1
      ? legacyBackupSchema.safeParse(value)
      : null

  if (!result) throw new Error(`Unsupported backup version: ${String(version)}.`)
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join('.') || 'backup'}: ${issue.message}`).join('; ')
    throw new Error(`Backup validation failed: ${details}`)
  }

  const parsed = result.data
  return {
    ...parsed,
    backupVersion: 2,
    preferences: { ...defaultPreferences, ...parsed.preferences },
    transactions: parsed.transactions.map(normalizeLegacyBudgetTransaction),
  } as unknown as PlannerBackup
}

export async function restorePlannerBackup(value: unknown, database: PlannerDatabase = db): Promise<void> {
  const backup = validatePlannerBackup(value)

  await database.transaction(
    'rw',
    database.tables,
    async () => {
      await database.goals.clear()
      await database.tasks.clear()
      await database.events.clear()
      await database.journalEntries.clear()
      await database.moodEntries.clear()
      await database.transactions.clear()
      await database.countdowns.clear()
      await database.preferences.clear()
      await database.goals.bulkPut(backup.goals)
      await database.tasks.bulkPut(backup.tasks)
      await database.events.bulkPut(backup.events)
      await database.journalEntries.bulkPut(backup.journalEntries)
      await database.moodEntries.bulkPut(backup.moodEntries)
      await database.transactions.bulkPut(backup.transactions)
      await database.countdowns.bulkPut(backup.countdowns)
      await database.preferences.put({ ...backup.preferences, id: 'settings' })
    },
  )
}

export function getBackupErrorMessage(error: unknown): string {
  if (error instanceof SyntaxError) return 'The backup is not valid JSON. Existing planner data was not changed.'
  if (error instanceof Error && error.message.startsWith('Backup validation failed:')) return `${error.message} Existing planner data was not changed.`
  if (error instanceof Error && error.message.startsWith('Unsupported backup')) return `${error.message} Existing planner data was not changed.`
  if (error instanceof Error && error.message.startsWith('Backup must')) return `${error.message} Existing planner data was not changed.`
  return 'The backup could not be restored. The transaction was rolled back, so existing planner data was not changed.'
}