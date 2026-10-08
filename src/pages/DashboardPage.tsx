import { useEffect, useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, GripVertical, NotebookText, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { usePlanner } from '../context/planner-context'
import { defaultDashboardLayout } from '../lib/defaults'
import type { DashboardWidgetConfig } from '../types'

const presetLayouts: Record<'balanced' | 'productivity' | 'dreamy', DashboardWidgetConfig[]> = {
  balanced: [
    { id: 'greeting', title: 'Greeting', visible: true, size: 12 },
    { id: 'schedule', title: 'Today’s rhythm', visible: true, size: 6 },
    { id: 'goals', title: 'Monthly goals', visible: true, size: 6 },
    { id: 'tasks', title: 'Tasks', visible: true, size: 4 },
    { id: 'mood', title: 'Soul check-in', visible: true, size: 4 },
    { id: 'budget', title: 'Budget snapshot', visible: true, size: 4 },
    { id: 'journal', title: 'Quick journal', visible: true, size: 6 },
  ],
  productivity: [
    { id: 'greeting', title: 'Greeting', visible: true, size: 12 },
    { id: 'schedule', title: 'Today’s rhythm', visible: true, size: 8 },
    { id: 'tasks', title: 'Tasks', visible: true, size: 4 },
    { id: 'goals', title: 'Monthly goals', visible: true, size: 7 },
    { id: 'budget', title: 'Budget snapshot', visible: true, size: 5 },
    { id: 'mood', title: 'Soul check-in', visible: true, size: 4 },
    { id: 'journal', title: 'Quick journal', visible: false, size: 6 },
  ],
  dreamy: [
    { id: 'greeting', title: 'Greeting', visible: true, size: 12 },
    { id: 'journal', title: 'Quick journal', visible: true, size: 6 },
    { id: 'mood', title: 'Soul check-in', visible: true, size: 3 },
    { id: 'goals', title: 'Monthly goals', visible: true, size: 6 },
    { id: 'schedule', title: 'Today’s rhythm', visible: true, size: 6 },
    { id: 'tasks', title: 'Tasks', visible: true, size: 3 },
    { id: 'budget', title: 'Budget snapshot', visible: true, size: 3 },
  ],
}

const allWidgetIds = ['greeting', 'schedule', 'goals', 'tasks', 'mood', 'budget', 'journal']

export default function DashboardPage() {
  const { goals, tasks, transactions, journalEntries, moodEntries, preferences, updatePreferences } = usePlanner()
  const [customizeMode, setCustomizeMode] = useState(false)
  const [layoutDraft, setLayoutDraft] = useState<DashboardWidgetConfig[]>(preferences.dashboardLayout?.length ? preferences.dashboardLayout : defaultDashboardLayout)
  const [lastLayout, setLastLayout] = useState<DashboardWidgetConfig[]>(preferences.dashboardLayout?.length ? preferences.dashboardLayout : defaultDashboardLayout)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  useEffect(() => {
    const nextLayout = preferences.dashboardLayout?.length ? preferences.dashboardLayout : defaultDashboardLayout
    setLayoutDraft(nextLayout)
    setLastLayout(nextLayout)
  }, [preferences.dashboardLayout])

  const today = new Date()
  const todayTasks = tasks.filter((task) => task.dueDate === today.toISOString().slice(0, 10))
  const currentMood = moodEntries[0]?.score ?? 3
  const monthlyIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const monthlyExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const visibleWidgets = layoutDraft.filter((widget) => widget.visible)

  const saveLayout = async (nextLayout: DashboardWidgetConfig[]) => {
    setLayoutDraft(nextLayout)
    setLastLayout(layoutDraft)
    await updatePreferences({
      ...preferences,
      dashboardLayout: nextLayout,
      dashboardWidgets: nextLayout.filter((widget) => widget.visible).map((widget) => widget.id),
    })
  }

  const handlePreset = async (preset: 'balanced' | 'productivity' | 'dreamy') => {
    const nextLayout = presetLayouts[preset]
    setLastLayout(layoutDraft)
    setLayoutDraft(nextLayout)
    await updatePreferences({
      ...preferences,
      layoutPreset: preset,
      dashboardLayout: nextLayout,
      dashboardWidgets: nextLayout.filter((widget) => widget.visible).map((widget) => widget.id),
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = layoutDraft.findIndex((widget) => widget.id === String(active.id))
    const newIndex = layoutDraft.findIndex((widget) => widget.id === String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(layoutDraft, oldIndex, newIndex)
    await saveLayout(reordered)
  }

  const resizeWidget = async (id: string, direction: 'increase' | 'decrease') => {
    const nextLayout = layoutDraft.map((widget) => {
      if (widget.id !== id) return widget
      const nextSize = direction === 'increase' ? Math.min(12, widget.size + 1) : Math.max(3, widget.size - 1)
      return { ...widget, size: nextSize }
    })
    await saveLayout(nextLayout)
  }

  const toggleWidgetVisibility = async (id: string) => {
    const nextLayout = layoutDraft.map((widget) =>
      widget.id === id ? { ...widget, visible: !widget.visible } : widget,
    )
    await saveLayout(nextLayout)
  }

  const addHiddenWidget = async (id: string) => {
    const nextLayout = layoutDraft.map((widget) =>
      widget.id === id ? { ...widget, visible: true } : widget,
    )
    await saveLayout(nextLayout)
  }

  const resetLayout = async () => {
    await saveLayout(defaultDashboardLayout)
  }

  const undoLayout = async () => {
    await saveLayout(lastLayout)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={() => setCustomizeMode((current) => !current)} className="pixel-button rounded-xl border border-dotted border-[#d8b9c5] bg-[#f7e8ef] px-4 py-2 text-sm font-medium text-berry">
          {customizeMode ? 'Done customizing' : 'Customize Layout'}
        </button>
      </div>

      {customizeMode && (
        <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {(['balanced', 'productivity', 'dreamy'] as const).map((preset) => (
              <button key={preset} type="button" onClick={() => void handlePreset(preset)} className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.18em] ${preferences.layoutPreset === preset ? 'bg-charcoal text-white' : 'bg-[#f5efee] text-charcoal/70'}`}>
                {preset}
              </button>
            ))}
            <button type="button" onClick={() => void resetLayout()} className="rounded-full border border-[#f0e7e2] bg-[#fffdfa] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-charcoal/70">Reset</button>
            <button type="button" onClick={() => void undoLayout()} className="rounded-full border border-[#f0e7e2] bg-[#fffdfa] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-charcoal/70">Undo</button>
          </div>

          <div className="space-y-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={layoutDraft.map((widget) => widget.id)} strategy={rectSortingStrategy}>
                {layoutDraft.map((widget) => (
                  <SortableWidget key={widget.id} widget={widget} onToggleVisibility={() => void toggleWidgetVisibility(widget.id)} onResize={(direction) => void resizeWidget(widget.id, direction)} />
                ))}
              </SortableContext>
            </DndContext>

            <div className="mt-4 flex flex-wrap gap-2">
              {allWidgetIds.map((widgetId) => {
                const exists = layoutDraft.some((widget) => widget.id === widgetId)

                if (exists) return null

                return (
                  <button key={widgetId} type="button" onClick={() => void addHiddenWidget(widgetId)} className="inline-flex items-center gap-2 rounded-full border border-[#f0e7e2] bg-[#fffdfa] px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-charcoal">
                    <Plus className="h-3 w-3" />
                    {widgetId}
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-12 gap-4">
        <AnimatePresence>
          {visibleWidgets.map((widget) => (
            <motion.div key={widget.id} layout style={{ gridColumn: `span ${widget.size}` }} className="dashboard-widget min-w-0">
              {renderWidget(widget.id, { greeting: preferences.greeting, todayTasks, goals, journalEntries: journalEntries, moodEntries, monthlyIncome, monthlyExpense, currentMood, tasks })}
            </motion.div>
          ))}
        </AnimatePresence>
      </section>
    </div>
  )
}

function renderWidget(
  widgetId: string,
  data: {
    greeting: string
    todayTasks: ReturnType<typeof usePlanner>['tasks']
    goals: ReturnType<typeof usePlanner>['goals']
    journalEntries: ReturnType<typeof usePlanner>['journalEntries']
    moodEntries: ReturnType<typeof usePlanner>['moodEntries']
    monthlyIncome: number
    monthlyExpense: number
    currentMood: number
    tasks: ReturnType<typeof usePlanner>['tasks']
  },
) {
  const { greeting, todayTasks, goals, journalEntries, monthlyIncome, monthlyExpense, currentMood, tasks } = data

  switch (widgetId) {
    case 'greeting':
      return (
        <section className="rounded-[30px] bg-[radial-gradient(circle_at_top,_rgba(233,177,200,0.22),_transparent_45%),_linear-gradient(135deg,_#fffdfc,_#f7f2ee)] p-6 shadow-bloom md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-charcoal/55">{new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}</p>
              <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-charcoal sm:text-4xl">{greeting}</h1>
            </div>
            <div className="rounded-2xl border border-[#f0e2dd] bg-white/70 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-charcoal/55">Today</p>
              <p className="mt-1 font-serif text-2xl text-berry">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </section>
      )
    case 'schedule':
      return (
        <Panel title="Today’s rhythm">
          <div className="space-y-4">
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-2xl border border-[#eee6e1] bg-[#fffdfa] px-3 py-3">
                  <div>
                    <p className="font-medium text-charcoal">{task.title}</p>
                    <p className="text-sm text-charcoal/60">{task.dueTime ?? 'Flexible timing'}</p>
                  </div>
                  <span className="rounded-full bg-[#f4ecf0] px-2.5 py-1 text-xs uppercase tracking-[0.12em] text-berry">{task.priority}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-charcoal/60">No tasks are scheduled for today yet.</p>
            )}
          </div>
          <Link to="/tasks" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-berry">
            Open tasks <ArrowRight className="h-4 w-4" />
          </Link>
        </Panel>
      )
    case 'goals':
      return (
        <Panel title="Monthly goals">
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => (
              <div key={goal.id}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium text-charcoal">{goal.title}</p>
                  <span className="text-xs uppercase tracking-[0.14em] text-charcoal/50">{goal.category}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#f2e8e3]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#e9b1c8] to-[#a9b7a4]" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )
    case 'tasks':
      return (
        <Panel title="Task pulse">
          <div className="space-y-3">
            {tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-2xl border border-[#eee6e1] bg-[#fffdfa] px-3 py-2">
                <span className="text-sm text-charcoal">{task.title}</span>
                <span className="rounded-full bg-[#f4ecf0] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-berry">{task.priority}</span>
              </div>
            ))}
          </div>
        </Panel>
      )
    case 'mood':
      return (
        <Panel title="Soul check-in">
          <div className="rounded-2xl bg-[#f9efe8] p-4">
            <p className="text-sm text-charcoal/60">Current mood</p>
            <p className="mt-2 text-4xl">{['😶', '🙂', '😊', '😌', '✨'][currentMood - 1] || '🙂'}</p>
          </div>
        </Panel>
      )
    case 'budget':
      return (
        <Panel title="Budget snapshot">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Income</span><strong>${monthlyIncome.toLocaleString()}</strong></div>
            <div className="flex items-center justify-between"><span>Expenses</span><strong>-${monthlyExpense.toLocaleString()}</strong></div>
            <div className="flex items-center justify-between border-t border-[#f0e7e2] pt-2 text-base font-semibold text-berry"><span>Remaining</span><strong>${(monthlyIncome - monthlyExpense).toLocaleString()}</strong></div>
          </div>
        </Panel>
      )
    case 'journal':
      return (
        <Panel title="Quick journal">
          <div className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfb] p-4">
            <div className="mb-2 flex items-center gap-2 text-charcoal/70">
              <NotebookText className="h-4 w-4" />
              <span className="text-sm">Latest reflection</span>
            </div>
            <p className="text-sm leading-6 text-charcoal/80">{journalEntries[0]?.content ?? 'A softer rhythm is still a real rhythm.'}</p>
          </div>
        </Panel>
      )
    default:
      return null
  }
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[#f0e7e2] bg-white/75 p-5 shadow-sm backdrop-blur-sm">
      <h2 className="mb-4 font-serif text-3xl text-charcoal">{title}</h2>
      {children}
    </div>
  )
}

function SortableWidget({ widget, onToggleVisibility, onResize }: { widget: DashboardWidgetConfig; onToggleVisibility: () => void; onResize: (direction: 'increase' | 'decrease') => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: widget.id })

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-charcoal/70">
          <button type="button" {...attributes} {...listeners} className="rounded-md border border-[#f0e7e2] bg-[#f9f5f2] p-1 text-charcoal/65">
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-xs uppercase tracking-[0.14em]">{widget.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onResize('decrease')} className="rounded-full border border-[#f0e7e2] px-2 py-1 text-xs">-</button>
          <button type="button" onClick={() => onResize('increase')} className="rounded-full border border-[#f0e7e2] px-2 py-1 text-xs">+</button>
          <button type="button" onClick={onToggleVisibility} className="rounded-full bg-[#f4edf0] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-berry">
            {widget.visible ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-charcoal/55">
        <span>Span</span>
        <span>{widget.size}</span>
      </div>
    </div>
  )
}
