import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const RelativeDate = (value: Date) => {
  const date = new Date(value)
  return { local: date.toLocaleString('es-ES'), relative: dayjs(date).fromNow() }
}
