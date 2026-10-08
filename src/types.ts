export type GoalCategory = 'Today' | 'This week' | 'This month' | 'This year' | 'Next five years' | 'Someday'
export type Priority = 'low' | 'medium' | 'high'
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'archived'
export type TaskStatus = 'pending' | 'completed'
export type BudgetType = 'income' | 'expense'
export type MoodScore = 1 | 2 | 3 | 4 | 5

export interface Goal {
  id: number
  title: string
  description: string
  category: GoalCategory
  priority: Priority
  targetDate: string
  status: GoalStatus
  progress: number
  milestones: string[]
  subtasks: string[]
  completedMilestones?: string[]
  completedSubtasks?: string[]
  notes: string
  image?: string
  associatedTaskIds: number[]
}

export interface Task {
  id: number
  title: string
  description: string
  category: string
  priority: Priority
  dueDate: string
  dueTime?: string
  tags: string[]
  status: TaskStatus
  completed: boolean
  goalId?: number
  list: 'daily' | 'weekly' | 'custom'
  order?: number
}

export interface CalendarEventItem {
  id: number
  title: string
  start: string
  end?: string
  allDay: boolean
  category: string
  notes?: string
  location?: string
  goalId?: number
  taskId?: number
}

export interface JournalEntry {
  id: number
  title: string
  content: string
  date: string
  tags: string[]
  mood?: number
  image?: string
}

export interface MoodEntry {
  id: number
  date: string
  score: MoodScore
  note?: string
  tags: string[]
}

export interface BudgetTransaction {
  id: number
  type: BudgetType
  amountCents: number | null
  legacyAmount?: number
  unitNeedsReview?: boolean
  category: string
  note: string
  date: string
}

export interface Countdown {
  id: number
  title: string
  date: string
  time?: string
  category: string
  accent: string
  notes?: string
  image?: string
}

export interface DashboardWidgetConfig {
  id: string
  title: string
  visible: boolean
  size: number
}

export interface AppPreferences {
  siteName: string
  greeting: string
  accent: string
  layoutPreset: 'balanced' | 'productivity' | 'dreamy'
  animationLevel: number
  showDecorativeElements: boolean
  dashboardWidgets: string[]
  dashboardLayout: DashboardWidgetConfig[]
  exportVersion: number
}

export interface DashboardWidgetItem {
  id: string
  title: string
  visible: boolean
  position: { x: number; y: number; w: number; h: number }
}
