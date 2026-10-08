import { createContext } from 'react'

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

export interface PlannerContextValue {
  goals: Goal[]
  tasks: Task[]
  events: CalendarEventItem[]
  journalEntries: JournalEntry[]
  moodEntries: MoodEntry[]
  transactions: BudgetTransaction[]
  countdowns: Countdown[]
  preferences: AppPreferences
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  setEvents: React.Dispatch<React.SetStateAction<CalendarEventItem[]>>
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>
  setMoodEntries: React.Dispatch<React.SetStateAction<MoodEntry[]>>
  setTransactions: React.Dispatch<React.SetStateAction<BudgetTransaction[]>>
  setCountdowns: React.Dispatch<React.SetStateAction<Countdown[]>>
  updatePreferences: (next: AppPreferences) => Promise<void>
  refreshData: (ensureSeed?: boolean) => Promise<void>
  addGoal: (goal: Goal) => Promise<void>
  addTask: (task: Task) => Promise<void>
  addEvent: (eventItem: CalendarEventItem) => Promise<void>
  addJournalEntry: (entry: JournalEntry) => Promise<void>
  addMoodEntry: (entry: MoodEntry) => Promise<void>
  addTransaction: (transaction: BudgetTransaction) => Promise<void>
  addCountdown: (countdown: Countdown) => Promise<void>
}

export const PlannerContext = createContext<PlannerContextValue | undefined>(undefined)