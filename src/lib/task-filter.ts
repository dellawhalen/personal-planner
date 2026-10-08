import type { Task } from '../types'

export type TaskStatusFilter = 'all' | 'today' | 'upcoming' | 'completed'
export type TaskListFilter = 'all' | Task['list']

export function filterTasks(
  tasks: Task[],
  listFilter: TaskListFilter,
  statusFilter: TaskStatusFilter,
  today: string,
): Task[] {
  return tasks.filter((task) => {
    if (listFilter !== 'all' && task.list !== listFilter) return false
    if (statusFilter === 'completed') return task.completed
    if (statusFilter === 'today') return task.dueDate === today
    if (statusFilter === 'upcoming') return !task.completed && Boolean(task.dueDate) && task.dueDate >= today
    return true
  })
}