<template>
  <div class="container-fluid">
    <div class="card shadow-sm">
      <calendar-header
        :current-date="calendarDateHeader"
        @date-navigator="navigateDate"
      ></calendar-header>
      <month-calendar :days-in-calendar="daysInCalendar"></month-calendar>
    </div>
  </div>
</template>

<script>
import { format, startOfMonth, endOfMonth } from 'date-fns'
import CalendarHeader from './subcomponents/CalendarHeader.vue'
import MonthCalendar from './subcomponents/MonthCalendar.vue'

export default {
  name: 'SmartCalendar',
  components: {
    CalendarHeader,
    MonthCalendar,
  },
  data() {
    return {
      currentDate: new Date(),
    }
  },
  computed: {
    calendarDateHeader() {
      return format(this.currentDate, 'MMMM yyyy')
    },
    /**
     * Optimize this
     */
    daysInCalendar() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()

      const firstDayOfMonth = startOfMonth(this.currentDate)
      const lastDayOfMonth = endOfMonth(this.currentDate)

      const days = []

      // Fill leading days (previous month)
      const startDay = firstDayOfMonth.getDay()
      for (let i = startDay; i > 0; i--) {
        const d = new Date(year, month, 1 - i)
        days.push({ date: d, isOtherMonth: true })
      }

      // Fill current month days
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const d = new Date(year, month, i)
        days.push({ date: d, isOtherMonth: false })
      }

      // Fill trailing days (next month)
      const endDay = lastDayOfMonth.getDay()
      for (let i = 1; i < 7 - endDay; i++) {
        const d = new Date(year, month + 1, i)
        days.push({ date: d, isOtherMonth: true })
      }

      return days
    },
  },
  methods: {
    navigateDate(nav) {
      const navigatorMapper = {
        prev: this.previousDate,
        next: this.nextDate,
        today: this.toggleToday,
      }

      if (navigatorMapper) navigatorMapper[nav]()
    },
    previousDate() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1,
      )
    },
    nextDate() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1,
      )
    },
    toggleToday() {
      this.currentDate = new Date()
    },
  },
}
</script>
