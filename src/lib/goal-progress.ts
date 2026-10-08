import type { Goal, GoalStatus } from '../types'

type GoalProgressSource = Pick<Goal, 'milestones' | 'subtasks' | 'completedMilestones' | 'completedSubtasks' | 'progress'>

export function calculateGoalProgress(goal: GoalProgressSource): number {
  const milestones = goal.milestones ?? []
  const subtasks = goal.subtasks ?? []
  const completedMilestones = goal.completedMilestones ?? []
  const completedSubtasks = goal.completedSubtasks ?? []
  const total = milestones.length + subtasks.length
  if (total === 0) return Math.max(0, Math.min(100, goal.progress))
  if (!Array.isArray(goal.completedMilestones) || !Array.isArray(goal.completedSubtasks)) {
    return Math.max(0, Math.min(100, goal.progress))
  }

  const completed = completedMilestones.length + completedSubtasks.length
  return Math.min(100, Math.round((completed / total) * 100))
}

export function getGoalProgressLabel(goal: Goal): string {
  if ((goal.milestones?.length ?? 0) + (goal.subtasks?.length ?? 0) === 0) return 'Manual progress'
  if (!Array.isArray(goal.completedMilestones) || !Array.isArray(goal.completedSubtasks)) return 'Saved progress · checklist history unavailable'
  return 'Checklist progress'
}

export function getGoalEditProgress(goal: Goal, milestones: string[], subtasks: string[]) {
  if (!Array.isArray(goal.completedMilestones) || !Array.isArray(goal.completedSubtasks)) {
    return {
      completedMilestones: goal.completedMilestones,
      completedSubtasks: goal.completedSubtasks,
      progress: Math.max(0, Math.min(100, goal.progress)),
      status: goal.status,
    }
  }

  const completedMilestones = (goal.completedMilestones ?? []).filter((item) => milestones.includes(item))
  const completedSubtasks = (goal.completedSubtasks ?? []).filter((item) => subtasks.includes(item))
  const progress = milestones.length + subtasks.length > 0
    ? calculateGoalProgress({ ...goal, milestones, subtasks, completedMilestones, completedSubtasks })
    : Math.max(0, Math.min(100, goal.progress))
  const status: GoalStatus = goal.status === 'archived'
    ? 'archived'
    : progress >= 100
      ? 'completed'
      : progress > 0
        ? 'in_progress'
        : 'not_started'

  return { completedMilestones, completedSubtasks, progress, status }
}