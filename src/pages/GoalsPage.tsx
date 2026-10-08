import { useMemo, useState } from 'react'
import { Check, Plus } from 'lucide-react'

import { db } from '../lib/db'
import { createRecordId } from '../lib/ids'
import { calculateGoalProgress, getGoalEditProgress, getGoalProgressLabel } from '../lib/goal-progress'
import { usePlanner } from '../context/use-planner'
import type { Goal, GoalCategory, GoalStatus, Priority } from '../types'

const initialGoal: Omit<Goal, 'id'> = {
  title: '',
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
}

export default function GoalsPage() {
  const { goals, addGoal, refreshData } = usePlanner()
  const [form, setForm] = useState(initialGoal)
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null)

  const goalCards = useMemo(() => goals, [goals])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmedTitle = form.title.trim()
    if (!trimmedTitle) return

    const existingGoal = editingGoalId === null ? undefined : goals.find((goal) => goal.id === editingGoalId)
    const milestones = form.milestones.map((item) => item.trim()).filter(Boolean)
    const subtasks = form.subtasks.map((item) => item.trim()).filter(Boolean)
    const progressState = existingGoal
      ? getGoalEditProgress(existingGoal, milestones, subtasks)
      : getGoalEditProgress({ ...form, id: 0 }, milestones, subtasks)
    const nextGoal: Goal = {
      ...existingGoal,
      id: editingGoalId ?? createRecordId(),
      ...form,
      title: trimmedTitle,
      milestones,
      subtasks,
      completedMilestones: progressState.completedMilestones,
      completedSubtasks: progressState.completedSubtasks,
      description: form.description || 'A little dream, made practical.',
      progress: progressState.progress,
      status: progressState.status,
    }

    if (editingGoalId === null) await addGoal(nextGoal)
    else {
      await db.goals.put(nextGoal)
      await refreshData()
    }
    setEditingGoalId(null)
    setForm(initialGoal)
  }

  const beginEdit = (goal: Goal) => {
    setEditingGoalId(goal.id)
    setForm({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      targetDate: goal.targetDate,
      status: goal.status,
      progress: goal.progress,
      milestones: [...goal.milestones],
      subtasks: [...goal.subtasks],
      completedMilestones: [...(goal.completedMilestones ?? [])],
      completedSubtasks: [...(goal.completedSubtasks ?? [])],
      notes: goal.notes,
      associatedTaskIds: [...goal.associatedTaskIds],
    })
    document.getElementById('goal-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const deleteGoal = async (goal: Goal) => {
    if (!window.confirm(`Delete “${goal.title}”? This cannot be undone.`)) return
    await db.goals.delete(goal.id)
    if (editingGoalId === goal.id) {
      setEditingGoalId(null)
      setForm(initialGoal)
    }
    await refreshData()
  }

  const toggleMilestone = async (goal: Goal, milestone: string) => {
    const currentCompleted = goal.completedMilestones ?? []
    const completedMilestones = currentCompleted.includes(milestone)
      ? currentCompleted.filter((item) => item !== milestone)
      : [...currentCompleted, milestone]

    const completedSubtasks = goal.completedSubtasks ?? []
    const progress = calculateGoalProgress({ ...goal, completedMilestones, completedSubtasks })
    const status: GoalStatus = progress >= 100 ? 'completed' : 'in_progress'

    await db.goals.update(goal.id, { completedMilestones, completedSubtasks, progress, status })
    await refreshData()
  }

  const toggleSubtask = async (goal: Goal, subtask: string) => {
    const currentCompleted = goal.completedSubtasks ?? []
    const completedSubtasks = currentCompleted.includes(subtask)
      ? currentCompleted.filter((item) => item !== subtask)
      : [...currentCompleted, subtask]

    const completedMilestones = goal.completedMilestones ?? []
    const progress = calculateGoalProgress({ ...goal, completedMilestones, completedSubtasks })
    const status: GoalStatus = progress >= 100 ? 'completed' : 'in_progress'

    await db.goals.update(goal.id, { completedMilestones, completedSubtasks, progress, status })
    await refreshData()
  }

  return (
    <div className="space-y-6">
      <section id="goal-form" className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-serif text-4xl text-charcoal">{editingGoalId === null ? 'Goals & dreams' : 'Edit goal'}</h1>
          <div className="rounded-full bg-[#f5ebef] px-3 py-1 text-xs uppercase tracking-[0.18em] text-berry">Card view</div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Goal title" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What are you creating or tending to?" className="min-h-[110px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as GoalCategory })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3">
            {['Today', 'This week', 'This month', 'This year', 'Next five years', 'Someday'].map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3">
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <input type="date" value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <label className="flex items-center gap-3 rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-2 text-sm text-charcoal/70">
            <span className="shrink-0">Manual progress</span>
            <input type="number" min="0" max="100" value={form.progress} onChange={(event) => setForm({ ...form, progress: Number(event.target.value) })} className="min-w-0 flex-1 bg-transparent px-2 py-1" />
            <span>%</span>
          </label>
          <textarea value={form.milestones.join('\n')} onChange={(event) => setForm({ ...form, milestones: event.target.value.split('\n').filter(Boolean) })} placeholder="Milestones (one per line)" className="min-h-[90px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <textarea value={form.subtasks.join('\n')} onChange={(event) => setForm({ ...form, subtasks: event.target.value.split('\n').filter(Boolean) })} placeholder="Actionable subtasks (one per line)" className="min-h-[90px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-charcoal px-4 py-3 font-medium text-white md:col-span-2">
            {editingGoalId === null && <Plus className="h-4 w-4" />} {editingGoalId === null ? 'Save goal' : 'Update goal'}
          </button>
        </form>
        {editingGoalId !== null && <button type="button" onClick={() => { setEditingGoalId(null); setForm(initialGoal) }} className="mt-3 rounded-xl border border-[#f0e7e2] px-4 py-2 text-sm text-charcoal/70">Cancel edit</button>}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {goalCards.map((goal) => {
          const progress = calculateGoalProgress(goal)
          return (
            <article key={goal.id} className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-charcoal/50">{goal.category}</p>
                  <h3 className="mt-2 font-serif text-3xl text-charcoal">{goal.title}</h3>
                </div>
                <span className="rounded-full bg-[#f5ebef] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-berry">
                  {goal.priority}
                </span>
              </div>

              <p className="text-sm leading-6 text-charcoal/70">{goal.description}</p>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-charcoal/55">
                  <span>{getGoalProgressLabel(goal)}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#f3e6e1]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#e9b1c8] to-[#a9b7a4]" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {goal.milestones.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.16em] text-charcoal/55">Milestones</p>
                    <ul className="space-y-2 text-sm text-charcoal/70">
                      {goal.milestones.map((milestone) => {
                        const done = (goal.completedMilestones ?? []).includes(milestone)
                        return (
                          <li key={milestone} className="flex items-center gap-2">
                            <button type="button" onClick={() => void toggleMilestone(goal, milestone)} className={`flex h-5 w-5 items-center justify-center rounded-full border ${done ? 'border-berry bg-[#f5ebef] text-berry' : 'border-[#e9d7d1] bg-white text-transparent'}`}>
                              <Check className="h-3 w-3" />
                            </button>
                            <span className={done ? 'line-through text-charcoal/50' : ''}>{milestone}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}

                {goal.subtasks.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.16em] text-charcoal/55">Subtasks</p>
                    <ul className="space-y-2 text-sm text-charcoal/70">
                      {goal.subtasks.map((subtask) => {
                        const done = (goal.completedSubtasks ?? []).includes(subtask)
                        return (
                          <li key={subtask} className="flex items-center gap-2">
                            <button type="button" onClick={() => void toggleSubtask(goal, subtask)} className={`flex h-5 w-5 items-center justify-center rounded-full border ${done ? 'border-sage bg-[#eef3ea] text-sage' : 'border-[#e9d7d1] bg-white text-transparent'}`}>
                              <Check className="h-3 w-3" />
                            </button>
                            <span className={done ? 'line-through text-charcoal/50' : ''}>{subtask}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-charcoal/55">
                <span>{goal.targetDate || 'no date'}</span>
                <div className="flex items-center gap-3">
                  <span>{goal.status}</span>
                  <button type="button" onClick={() => beginEdit(goal)} className="text-berry underline">Edit</button>
                  <button type="button" onClick={() => void deleteGoal(goal)} className="text-berry underline">Delete</button>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
