const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/

export function formatLocalDate(date = new Date()): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}

export function formatLocalDateTimeInput(date = new Date()): string {
  return `${formatLocalDate(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function parseLocalDate(value: string): Date | null {
  const match = datePattern.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

export function parseLocalDateTime(dateValue: string, timeValue = '00:00'): Date | null {
  const date = parseLocalDate(dateValue)
  const time = timePattern.exec(timeValue)
  if (!date || !time) return null

  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(time[1]), Number(time[2]))
}

export function formatLocalDateLabel(value: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  const date = parseLocalDate(value)
  return date ? date.toLocaleDateString('en-US', options) : value
}

export function getLocalMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}