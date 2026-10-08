let lastGeneratedId = 0

export function createRecordId(): number {
  lastGeneratedId = Math.max(Date.now(), lastGeneratedId + 1)
  return lastGeneratedId
}