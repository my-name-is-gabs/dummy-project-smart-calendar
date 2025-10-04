import { startOfMonth, endOfMonth } from 'date-fns'

export function generateCalendarDays(currentDate) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const minWeeks = 5

  const firstDayOfMonth = startOfMonth(currentDate)
  const lastDayOfMonth = endOfMonth(currentDate)

  const starting = firstDayOfMonth.getDay()
  const monthNumDays = lastDayOfMonth.getDate()
  const ending = lastDayOfMonth.getDay()

  const prevDays = renderPrevDaysInCalendar(year, month, starting)
  const days = renderDaysInCalendar(year, month, monthNumDays)
  let nextDays = renderNextDaysInCalendar(year, month, ending)

  // ensure minimum weeks
  const totalCells = prevDays.length + days.length + nextDays.length
  const currentWeeks = Math.ceil(totalCells / 7)
  if (currentWeeks < minWeeks) {
    const extraCells = (minWeeks - currentWeeks) * 7
    for (let i = 1; i <= extraCells; i++) {
      nextDays.push({
        date: new Date(year, month + 1, nextDays.length + i),
        isOtherMonth: true,
      })
    }
  }

  return [...prevDays, ...days, ...nextDays]
}

function renderPrevDaysInCalendar(year, month, numOfDays) {
  const prevDays = []
  for (let counter = numOfDays; counter > 0; --counter) {
    const day = new Date(year, month, 1 - counter)
    prevDays.push({ date: day, isOtherMonth: true })
  }
  return prevDays
}

function renderDaysInCalendar(year, month, monthNumDays) {
  const days = []
  for (let counter = 1; counter <= monthNumDays; counter++) {
    const day = new Date(year, month, counter)
    days.push({ date: day, isOtherMonth: false })
  }
  return days
}

function renderNextDaysInCalendar(year, month, lastWeekday) {
  const days = []
  const daysToAdd = (6 - lastWeekday) % 7
  for (let counter = 1; counter <= daysToAdd; counter++) {
    const day = new Date(year, month + 1, counter)
    days.push({ date: day, isOtherMonth: true })
  }
  return days
}
