import type { Task } from '../types'

export function reorderVisibleTasks(allTasks: Task[], visibleTasks: Task[], activeId: number, overId: number): Task[] {
  const oldIndex = visibleTasks.findIndex((task) => task.id === activeId)
  const newIndex = visibleTasks.findIndex((task) => task.id === overId)
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return allTasks

  const reorderedVisible = [...visibleTasks]
  const [moved] = reorderedVisible.splice(oldIndex, 1)
  reorderedVisible.splice(newIndex, 0, moved)

  let visibleIndex = 0
  return allTasks.map((task) => {
    if (!visibleTasks.some((visibleTask) => visibleTask.id === task.id)) return task
    return reorderedVisible[visibleIndex++]
  })
}