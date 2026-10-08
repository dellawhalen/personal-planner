import { describe, expect, it } from 'vitest'

import { filterTasks } from './task-filter'
import type { Task } from '../types'

function task(id: number, list: Task['list'], dueDate: string, completed = false): Task {
  return {
    id,
    title: `Task ${id}`,
    description: '',
    category: 'personal',
    priority: 'medium',
    dueDate,
    tags: [],
    status: completed ? 'completed' : 'pending',
    completed,
    list,
  }
}

describe('task filters', () => {
  const tasks = [
    task(1, 'daily', '2026-10-08'),
    task(2, 'weekly', '2026-10-09'),
    task(3, 'custom', '2026-10-07', true),
  ]

  it('separates list views and composes them with status/date filters', () => {
    expect(filterTasks(tasks, 'daily', 'all', '2026-10-08').map(({ id }) => id)).toEqual([1])
    expect(filterTasks(tasks, 'weekly', 'upcoming', '2026-10-08').map(({ id }) => id)).toEqual([2])
    expect(filterTasks(tasks, 'custom', 'completed', '2026-10-08').map(({ id }) => id)).toEqual([3])
  })

  it('shows only tasks due on the provided local date in today view', () => {
    expect(filterTasks(tasks, 'all', 'today', '2026-10-08').map(({ id }) => id)).toEqual([1])
  })
})