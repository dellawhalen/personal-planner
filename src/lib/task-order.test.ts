import { describe, expect, it } from 'vitest'

import { reorderVisibleTasks } from './task-order'
import type { Task } from '../types'

function task(id: number, list: Task['list'] = 'daily', completed = false): Task {
  return {
    id,
    title: `Task ${id}`,
    description: '',
    category: 'personal',
    priority: 'medium',
    dueDate: '2026-10-08',
    tags: [],
    status: completed ? 'completed' : 'pending',
    completed,
    list,
    order: id,
  }
}

describe('filtered task ordering', () => {
  it('reorders visible tasks without moving hidden tasks out of their slots', () => {
    const all = [task(1, 'daily'), task(2, 'weekly'), task(3, 'daily'), task(4, 'custom')]
    const visible = [all[0], all[2]]
    const reordered = reorderVisibleTasks(all, visible, 1, 3)

    expect(reordered.map((item) => item.id)).toEqual([3, 2, 1, 4])
  })

  it('keeps nonmatching completion-filtered tasks unchanged', () => {
    const all = [task(1, 'daily', true), task(2, 'daily'), task(3, 'daily', true)]
    const visibleCompleted = [all[0], all[2]]

    expect(reorderVisibleTasks(all, visibleCompleted, 1, 3).map((item) => item.id)).toEqual([3, 2, 1])
  })

  it('returns the original order if the drag target is not visible', () => {
    const all = [task(1), task(2)]
    expect(reorderVisibleTasks(all, [all[0]], 1, 2)).toEqual(all)
  })
})