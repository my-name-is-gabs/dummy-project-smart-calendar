<template>
  <div class="calendar card shadow-sm">
    <!-- Header -->
    <div class="card-header d-flex justify-content-between align-items-center">
      <button class="btn btn-sm btn-outline-primary" @click="prevMonth">&lt;</button>
      <h5 class="mb-0">{{ monthYear }}</h5>
      <button class="btn btn-sm btn-outline-primary" @click="nextMonth">&gt;</button>
    </div>

    <!-- Weekdays -->
    <div class="d-grid border-bottom" :style="gridStyle">
      <div v-for="day in weekdays" :key="day" class="text-center fw-bold py-2">
        {{ day }}
      </div>
    </div>

    <!-- Days Grid -->
    <div class="d-grid" :style="gridStyle">
      <div
        v-for="(day, index) in daysInCalendar"
        :key="index"
        class="day-cell border p-1 position-relative d-flex flex-column"
        :class="{
          'bg-light text-muted': day.isOtherMonth,
          'border-primary': isToday(day.date),
        }"
        @click="selectDay(day)"
      >
        <!-- Day Number -->
        <div
          class="d-flex justify-content-end pe-1 mb-1"
          :class="{ 'fw-bold text-primary': isToday(day.date) }"
        >
          {{ getDayNumber(day.date) }}
        </div>

        <!-- Events -->
        <div class="flex-grow-1 overflow-auto">
          <div v-for="(event, i) in getEventsForDay(day.date)" :key="i" class="event-pill mb-1">
            <small class="badge bg-info text-dark w-100 text-start">
              {{ event.time }} - {{ event.title }}
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format, startOfMonth, endOfMonth, isSameDay } from 'date-fns'

export default {
  name: 'SmartCalendar',

  props: {
    events: {
      type: Array,
      default: () => [
        { date: new Date(), title: 'Team Meeting', time: '10:00 AM' },
        { date: new Date(), title: 'Lunch with Client', time: '1:00 PM' },
        { date: new Date(), title: 'Project Review', time: '4:00 PM' },
      ],
    },
  },

  data() {
    return {
      today: new Date(),
      currentDate: new Date(),
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      gridStyle: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
      },
    }
  },

  computed: {
    monthYear() {
      return format(this.currentDate, 'MMMM yyyy')
    },

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
    prevMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1,
      )
    },
    nextMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1,
      )
    },
    isToday(date) {
      return isSameDay(date, this.today)
    },
    getDayNumber(date) {
      return format(date, 'd')
    },
    getEventsForDay(date) {
      return this.events.filter((event) => isSameDay(new Date(event.date), date))
    },
    selectDay(day) {
      if (!day.isOtherMonth) {
        alert(`Selected: ${format(day.date, 'PPP')}`)
      }
    },
  },
}
</script>

<style scoped>
.calendar {
  max-width: 1000px;
  margin: auto;
}

.day-cell {
  min-height: 120px; /* Expand cell height */
}

.event-pill {
  font-size: 0.8rem;
}

.overflow-auto {
  max-height: 100px; /* prevent overflow if too many events */
}
</style>
