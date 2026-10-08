import { useMemo, useState } from 'react'
import { Check, Plus } from 'lucide-react'

import { db } from '../lib/db'
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

function calculateGoalProgress(goal: Goal) {
  const milestoneTotal = goal.milestones.length
  const subtaskTotal = goal.subtasks.length
  const completedTotal = goal.completedMilestones.length + goal.completedSubtasks.length
  const total = milestoneTotal + subtaskTotal

  if (total === 0) return 0
  return Math.min(100, Math.round((completedTotal / total) * 100))
}

export default function GoalsPage() {
  const { goals, addGoal, refreshData } = usePlanner()
  const [form, setForm] = useState(initialGoal)

  const goalCards = useMemo(() => goals, [goals])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmedTitle = form.title.trim()
    if (!trimmedTitle) return

    const nextGoal: Goal = {
      id: Date.now(),
      ...form,
      title: trimmedTitle,
      milestones: form.milestones.filter(Boolean),
      subtasks: form.subtasks.filter(Boolean),
      completedMilestones: [],
      completedSubtasks: [],
      description: form.description || 'A little dream, made practical.',
      progress: 0,
    }

    await addGoal(nextGoal)
    setForm(initialGoal)
  }

  const toggleMilestone = async (goal: Goal, milestone: string) => {
    const completedMilestones = goal.completedMilestones.includes(milestone)
      ? goal.completedMilestones.filter((item) => item !== milestone)
      : [...goal.completedMilestones, milestone]

    const progress = calculateGoalProgress({ ...goal, completedMilestones })
    const status: GoalStatus = progress >= 100 ? 'completed' : 'in_progress'

    await db.goals.update(goal.id, { completedMilestones, progress, status })
    await refreshData()
  }

  const toggleSubtask = async (goal: Goal, subtask: string) => {
    const completedSubtasks = goal.completedSubtasks.includes(subtask)
      ? goal.completedSubtasks.filter((item) => item !== subtask)
      : [...goal.completedSubtasks, subtask]

    const progress = calculateGoalProgress({ ...goal, completedSubtasks })
    const status: GoalStatus = progress >= 100 ? 'completed' : 'in_progress'

    await db.goals.update(goal.id, { completedSubtasks, progress, status })
    await refreshData()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-serif text-4xl text-charcoal">Goals & dreams</h1>
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
          <textarea value={form.milestones.join('\n')} onChange={(event) => setForm({ ...form, milestones: event.target.value.split('\n').filter(Boolean) })} placeholder="Milestones (one per line)" className="min-h-[90px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <textarea value={form.subtasks.join('\n')} onChange={(event) => setForm({ ...form, subtasks: event.target.value.split('\n').filter(Boolean) })} placeholder="Actionable subtasks (one per line)" className="min-h-[90px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-charcoal px-4 py-3 font-medium text-white md:col-span-2">
            <Plus className="h-4 w-4" /> Save goal
          </button>
        </form>
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
                  <span>Progress</span>
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
                        const done = goal.completedMilestones.includes(milestone)
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
                        const done = goal.completedSubtasks.includes(subtask)
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
                <span>{goal.status}</span>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
