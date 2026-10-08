import { useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

import { db } from '../lib/db'
import { createRecordId } from '../lib/ids'
import { formatLocalDate } from '../lib/local-date'
import { filterTasks } from '../lib/task-filter'
import { reorderVisibleTasks } from '../lib/task-order'
import { usePlanner } from '../context/use-planner'
import type { Priority, Task } from '../types'

const emptyTask = {
  title: '',
  description: '',
  category: 'personal',
  priority: 'medium' as Priority,
  dueDate: '',
  dueTime: '',
  tags: '',
  list: 'daily' as Task['list'],
  status: 'pending' as Task['status'],
  completed: false,
  goalId: undefined as number | undefined,
}

export default function TasksPage() {
  const { tasks, refreshData } = usePlanner()
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all')
  const [listView, setListView] = useState<'all' | Task['list']>('all')
  const [form, setForm] = useState(emptyTask)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const orderedTasks = [...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const visibleTasks = filterTasks(orderedTasks, listView, filter, formatLocalDate())

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.title.trim()) return

    const existingTask = editingTaskId === null ? undefined : tasks.find((task) => task.id === editingTaskId)

    const task: Task = {
      id: editingTaskId ?? createRecordId(),
      title: form.title.trim(),
      description: form.description,
      category: form.category,
      priority: form.priority,
      dueDate: form.dueDate || formatLocalDate(),
      dueTime: form.dueTime,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      list: form.list,
      status: form.completed ? 'completed' : 'pending',
      completed: form.completed,
      goalId: form.goalId,
      order: existingTask?.order ?? orderedTasks.length,
    }

    await db.tasks.put(task)
    await refreshData()
    setEditingTaskId(null)
    setForm(emptyTask)
  }

  const beginEdit = (task: Task) => {
    setEditingTaskId(task.id)
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime ?? '',
      tags: task.tags.join(', '),
      list: task.list,
      status: task.status,
      completed: task.completed,
      goalId: task.goalId,
    })
    document.getElementById('task-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const toggleTask = async (task: Task) => {
    await db.tasks.update(task.id, {
      completed: !task.completed,
      status: task.completed ? 'pending' : 'completed',
    })
    await refreshData()
  }

  const deleteTask = async (taskId: number) => {
    await db.tasks.delete(taskId)
    await refreshData()
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const reordered = reorderVisibleTasks(orderedTasks, visibleTasks, Number(active.id), Number(over.id))
    const nextOrder = reordered.map((task, index) => ({ ...task, order: index }))

    await Promise.all(nextOrder.map((task) => db.tasks.put(task)))
    await refreshData()
  }

  return (
    <div className="space-y-6">
      <section id="task-form" className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-serif text-4xl text-charcoal">{editingTaskId === null ? 'To-do lists' : 'Edit task'}</h1>
          <div className="rounded-full bg-[#eef3ea] px-3 py-1 text-xs uppercase tracking-[0.18em] text-charcoal">{listView}</div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Task title" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Notes" className="min-h-[100px] rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <input type="time" value={form.dueTime} onChange={(event) => setForm({ ...form, dueTime: event.target.value })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3" />
          <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3">
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <select value={form.list} onChange={(event) => setForm({ ...form, list: event.target.value as Task['list'] })} className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </select>
          <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="Tags (comma separated)" className="rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] px-4 py-3 md:col-span-2" />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-charcoal px-4 py-3 font-medium text-white md:col-span-2">
            {editingTaskId === null && <Plus className="h-4 w-4" />} {editingTaskId === null ? 'Add task' : 'Update task'}
          </button>
        </form>
        {editingTaskId !== null && <button type="button" onClick={() => { setEditingTaskId(null); setForm(emptyTask) }} className="mt-3 rounded-xl border border-[#f0e7e2] px-4 py-2 text-sm text-charcoal/70">Cancel edit</button>}
      </section>

      <section className="rounded-[28px] border border-[#f0e7e2] bg-white/80 p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2" aria-label="Task list">
          {(['all', 'daily', 'weekly', 'custom'] as const).map((view) => (
            <button key={view} type="button" onClick={() => setListView(view)} aria-pressed={listView === view} className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${listView === view ? 'bg-sage text-charcoal' : 'bg-[#f6f1ee] text-charcoal/70'}`}>
              {view === 'all' ? 'All lists' : view}
            </button>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-2" aria-label="Task status filter">
          {(['all', 'today', 'upcoming', 'completed'] as const).map((view) => (
            <button key={view} onClick={() => setFilter(view)} className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${filter === view ? 'bg-charcoal text-white' : 'bg-[#f6f1ee] text-charcoal/70'}`}>
              {view}
            </button>
          ))}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleTasks.map((task) => task.id)} strategy={rectSortingStrategy}>
            <div className="space-y-3">
              {visibleTasks.map((task) => (
                <SortableTaskItem key={task.id} task={task} onToggle={() => void toggleTask(task)} onDelete={() => void deleteTask(task.id)} onEdit={() => beginEdit(task)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>
    </div>
  )
}

function SortableTaskItem({ task, onToggle, onDelete, onEdit }: { task: Task; onToggle: () => void; onDelete: () => void; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })

  return (
    <motion.div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} layout className="flex flex-col gap-3 rounded-2xl border border-[#f0e7e2] bg-[#fffdfa] p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <button type="button" {...attributes} {...listeners} className="mt-1 rounded-md border border-[#f0e7e2] bg-[#f9f5f2] p-1 text-charcoal/60">
          <GripVertical className="h-4 w-4" />
        </button>
        <input checked={task.completed} onChange={onToggle} type="checkbox" className="mt-1 h-4 w-4 accent-[#a9b7a4]" />
        <div>
          <p className={`font-medium ${task.completed ? 'text-charcoal/55 line-through' : 'text-charcoal'}`}>{task.title}</p>
          <p className="text-sm text-charcoal/60">{task.dueDate} {task.dueTime ? `· ${task.dueTime}` : ''}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#f5ebef] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-berry">{task.priority}</span>
        <button type="button" onClick={onEdit} className="rounded-full border border-[#f0e7e2] px-3 py-1 text-xs uppercase tracking-[0.12em] text-charcoal/60">Edit</button>
        <button onClick={onDelete} className="rounded-full border border-[#f0e7e2] px-3 py-1 text-xs uppercase tracking-[0.12em] text-charcoal/60">Delete</button>
      </div>
    </motion.div>
  )
}
