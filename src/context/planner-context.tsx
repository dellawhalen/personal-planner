import {
  startTransition,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { db, seedDatabase } from '../lib/db'
import { defaultPreferences } from '../lib/defaults'
import { PlannerContext, type PlannerContextValue } from './planner-context-value'
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

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<CalendarEventItem[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([])
  const [countdowns, setCountdowns] = useState<Countdown[]>([])
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences)

  const refreshData = async (ensureSeed = false) => {
    if (ensureSeed) await seedDatabase()
    const [loadedGoals, loadedTasks, loadedEvents, loadedJournalEntries, loadedMoodEntries, loadedTransactions, loadedCountdowns, loadedPreferences] = await Promise.all([
      db.goals.orderBy('id').reverse().toArray(),
      db.tasks.orderBy('id').reverse().toArray(),
      db.events.orderBy('id').reverse().toArray(),
      db.journalEntries.orderBy('id').reverse().toArray(),
      db.moodEntries.orderBy('id').reverse().toArray(),
      db.transactions.orderBy('id').reverse().toArray(),
      db.countdowns.orderBy('id').reverse().toArray(),
      db.preferences.get('settings'),
    ])

    startTransition(() => {
      setGoals(loadedGoals)
      setTasks(loadedTasks)
      setEvents(loadedEvents)
      setJournalEntries(loadedJournalEntries)
      setMoodEntries(loadedMoodEntries)
      setTransactions(loadedTransactions)
      setCountdowns(loadedCountdowns)
      setPreferences({ ...defaultPreferences, ...loadedPreferences })
    })
  }

  useEffect(() => {
    void refreshData(true)
  }, [])

  const updatePreferences = async (next: AppPreferences) => {
    setPreferences(next)
    await db.preferences.put({ ...next, id: 'settings' })
  }

  const addGoal = async (goal: Goal) => {
    await db.goals.put(goal)
    await refreshData()
  }

  const addTask = async (task: Task) => {
    await db.tasks.put(task)
    await refreshData()
  }

  const addEvent = async (eventItem: CalendarEventItem) => {
    await db.events.put(eventItem)
    await refreshData()
  }

  const addJournalEntry = async (entry: JournalEntry) => {
    await db.journalEntries.put(entry)
    await refreshData()
  }

  const addMoodEntry = async (entry: MoodEntry) => {
    await db.moodEntries.put(entry)
    await refreshData()
  }

  const addTransaction = async (transaction: BudgetTransaction) => {
    await db.transactions.put(transaction)
    await refreshData()
  }

  const addCountdown = async (countdown: Countdown) => {
    await db.countdowns.put(countdown)
    await refreshData()
  }

  const value = useMemo<PlannerContextValue>(
    () => ({
      goals,
      tasks,
      events,
      journalEntries,
      moodEntries,
      transactions,
      countdowns,
      preferences,
      setGoals,
      setTasks,
      setEvents,
      setJournalEntries,
      setMoodEntries,
      setTransactions,
      setCountdowns,
      updatePreferences,
      refreshData,
      addGoal,
      addTask,
      addEvent,
      addJournalEntry,
      addMoodEntry,
      addTransaction,
      addCountdown,
    }),
    [countdowns, events, goals, journalEntries, moodEntries, preferences, tasks, transactions],
  )

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
}
