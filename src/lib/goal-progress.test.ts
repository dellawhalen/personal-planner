import { describe, expect, it } from 'vitest'

import { calculateGoalProgress, getGoalEditProgress, getGoalProgressLabel } from './goal-progress'
import type { Goal } from '../types'

const baseGoal: Goal = {
  id: 1,
  title: 'A goal',
  description: '',
  category: 'This month',
  priority: 'medium',
  targetDate: '',
  status: 'in_progress',
  progress: 37,
  milestones: [],
  subtasks: [],
  completedMilestones: [],
  completedSubtasks: [],
  notes: '',
  associatedTaskIds: [],
}

describe('goal progress', () => {
  it('keeps a readable manual progress value when there is no checklist', () => {
    expect(calculateGoalProgress(baseGoal)).toBe(37)
    expect(getGoalProgressLabel(baseGoal)).toBe('Manual progress')
  })

  it('derives progress from completed milestones and subtasks', () => {
    const goal = { ...baseGoal, milestones: ['Plan', 'Start'], subtasks: ['One'], completedMilestones: ['Plan'], completedSubtasks: ['One'] }
    expect(calculateGoalProgress(goal)).toBe(67)
    expect(getGoalProgressLabel(goal)).toBe('Checklist progress')
  })

  it('bounds manual progress to the supported range', () => {
    expect(calculateGoalProgress({ ...baseGoal, progress: 120 })).toBe(100)
    expect(calculateGoalProgress({ ...baseGoal, progress: -1 })).toBe(0)
  })

  it('preserves completed checklist items during edits and updates completion status', () => {
    const goal = {
      ...baseGoal,
      progress: 0,
      milestones: ['Plan', 'Launch'],
      completedMilestones: ['Plan'],
      status: 'in_progress' as const,
    }

    expect(getGoalEditProgress(goal, ['Plan', 'Launch', 'Review'], [])).toMatchObject({
      completedMilestones: ['Plan'],
      progress: 33,
      status: 'in_progress',
    })
    expect(getGoalEditProgress(goal, ['Plan'], [])).toMatchObject({
      completedMilestones: ['Plan'],
      progress: 100,
      status: 'completed',
    })
  })

  it('preserves saved progress for older goals that lack completion history', () => {
    const legacyGoal = { ...baseGoal, milestones: ['Plan'], subtasks: [] } as Goal
    delete (legacyGoal as Partial<Goal>).completedMilestones
    delete (legacyGoal as Partial<Goal>).completedSubtasks

    expect(calculateGoalProgress(legacyGoal)).toBe(37)
    expect(getGoalProgressLabel(legacyGoal)).toBe('Saved progress · checklist history unavailable')
    expect(getGoalEditProgress(legacyGoal, ['Plan', 'Review'], [])).toMatchObject({
      progress: 37,
      status: 'in_progress',
    })
  })
})