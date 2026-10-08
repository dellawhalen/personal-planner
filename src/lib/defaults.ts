import type { AppPreferences, BudgetTransaction, CalendarEventItem, Countdown, DashboardWidgetConfig, Goal, JournalEntry, MoodEntry, Task } from '../types'

export const defaultDashboardLayout: DashboardWidgetConfig[] = [
  { id: 'greeting', title: 'Greeting', visible: true, size: 12 },
  { id: 'schedule', title: 'Today’s rhythm', visible: true, size: 6 },
  { id: 'goals', title: 'Monthly goals', visible: true, size: 6 },
  { id: 'tasks', title: 'Tasks', visible: true, size: 4 },
  { id: 'mood', title: 'Soul check-in', visible: true, size: 4 },
  { id: 'budget', title: 'Budget snapshot', visible: true, size: 4 },
  { id: 'journal', title: 'Quick journal', visible: true, size: 6 },
]

export const defaultPreferences: AppPreferences = {
  siteName: 'a life in bloom.',
  greeting: 'Good morning, little bloom.',
  accent: '#e9b1c8',
  layoutPreset: 'balanced',
  animationLevel: 1,
  showDecorativeElements: true,
  dashboardWidgets: ['greeting', 'schedule', 'goals', 'tasks', 'mood', 'budget', 'journal'],
  dashboardLayout: defaultDashboardLayout,
  exportVersion: 1,
}

export const defaultGoals: Goal[] = [
  {
    id: 1,
    title: 'Create a grounded creative routine',
    description: 'Build a rhythm that supports both rest and ambition.',
    category: 'This month',
    priority: 'high',
    targetDate: '2026-10-31',
    status: 'in_progress',
    progress: 55,
    milestones: ['Set a weekly creative block', 'Gather inspiration', 'Finish one personal project'],
    completedMilestones: ['Set a weekly creative block'],
    subtasks: ['Plan Monday sketch time', 'Keep a small photo log'],
    completedSubtasks: ['Plan Monday sketch time'],
    notes: 'Keep it gentle and sustainable.',
    associatedTaskIds: [1, 2],
  },
  {
    id: 2,
    title: 'Build the home base I want to come back to',
    description: 'Decorate my space to feel like a sanctuary.',
    category: 'This year',
    priority: 'medium',
    targetDate: '2027-01-15',
    status: 'not_started',
    progress: 15,
    milestones: ['Choose a color palette', 'Declutter one area', 'Add calming details'],
    completedMilestones: [],
    subtasks: ['Arrange a shopping list', 'Organize my desk'],
    completedSubtasks: [],
    notes: 'Small details matter.',
    associatedTaskIds: [3],
  },
]

export const defaultTasks: Task[] = [
  {
    id: 1,
    title: 'Morning journaling',
    description: 'Write three lines before work.',
    category: 'wellness',
    priority: 'medium',
    dueDate: '2026-10-08',
    dueTime: '08:00',
    tags: ['ritual'],
    status: 'pending',
    completed: false,
    list: 'daily',
    order: 0,
  },
  {
    id: 2,
    title: 'Review creative inspiration board',
    description: 'Gather references for the next project.',
    category: 'creative',
    priority: 'high',
    dueDate: '2026-10-09',
    dueTime: '19:00',
    tags: ['vision'],
    status: 'pending',
    completed: false,
    list: 'weekly',
    order: 1,
  },
  {
    id: 3,
    title: 'Meal prep for the week',
    description: 'Prep a few simple dinners and snacks.',
    category: 'home',
    priority: 'medium',
    dueDate: '2026-10-10',
    dueTime: '18:00',
    tags: ['family'],
    status: 'pending',
    completed: false,
    list: 'custom',
    order: 2,
  },
]

export const defaultEvents: CalendarEventItem[] = [
  {
    id: 1,
    title: 'Studio time',
    start: '2026-10-08T09:00:00',
    end: '2026-10-08T11:00:00',
    allDay: false,
    category: 'creative',
    notes: 'Work on the new concept board.',
  },
  {
    id: 2,
    title: 'Dinner with friends',
    start: '2026-10-12',
    end: '2026-10-12',
    allDay: true,
    category: 'social',
    notes: 'Meet at the garden café.',
  },
]

export const defaultJournalEntries: JournalEntry[] = [
  {
    id: 1,
    title: 'A quiet beginning',
    content: 'Today felt like a soft landing. I am learning that rest is part of the creative process, not the opposite of it.',
    date: '2026-10-08',
    tags: ['reflection', 'gentle'],
    mood: 4,
  },
]

export const defaultMoodEntries: MoodEntry[] = [
  {
    id: 1,
    date: '2026-10-08',
    score: 4,
    note: 'Whole and calm with a little spark.',
    tags: ['balanced'],
  },
]

export const defaultTransactions: BudgetTransaction[] = [
  {
    id: 1,
    type: 'income',
    amount: 2600,
    category: 'Salary',
    note: 'Monthly paycheck',
    date: '2026-10-01',
  },
  {
    id: 2,
    type: 'expense',
    amount: 180,
    category: 'Groceries',
    note: 'Weekly market run',
    date: '2026-10-05',
  },
  {
    id: 3,
    type: 'expense',
    amount: 90,
    category: 'Self-care',
    note: 'Facial and candle set',
    date: '2026-10-06',
  },
]

export const defaultCountdowns: Countdown[] = [
  {
    id: 1,
    title: 'Paris trip',
    date: '2027-05-14',
    time: '08:00',
    category: 'travel',
    accent: '#79525f',
    notes: 'Book the studio apartment soon.',
  },
  {
    id: 2,
    title: 'Submit portfolio',
    date: '2026-11-20',
    category: 'work',
    accent: '#a9b7a4',
    notes: 'Reach out for feedback before the deadline.',
  },
]
