import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/en'

dayjs.extend(relativeTime)
dayjs.locale('en')

/**
 * Format datetime string
 * @param time Time string
 * @param format Format string, default 'YYYY-MM-DD HH:mm:ss'
 * @returns Formatted time string, or empty string if time is empty
 */
export const formatTime = (time: string | undefined, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!time) return ''
  return dayjs(time).format(format)
}

/**
 * Format time as relative (e.g. "2 hours ago")
 * @param time Time string
 * @returns Relative time string
 */
export const formatRelativeTime = (time: string | undefined): string => {
  if (!time) return ''
  return dayjs(time).fromNow()
}

/**
 * Format time as date only
 * @param time Time string
 * @returns Date string e.g. "2024-01-01"
 */
export const formatDate = (time: string | undefined): string => {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD')
}
