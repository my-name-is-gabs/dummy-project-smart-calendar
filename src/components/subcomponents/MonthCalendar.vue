<template>
  <main>
    <!-- Weeks -->
    <div class="calendarGrid">
      <div
        class="text-center py-2 fw-bold border-bottom border-secondary"
        v-for="(week, index) in weeks"
        :key="index"
      >
        {{ week }}
      </div>
    </div>

    <!-- Days & events -->
    <div class="calendarGrid">
      <div
        class="day-cell border border-secondary-subtle position-relative"
        v-for="(day, i) in daysInCalendar"
        :key="i"
      >
        <div
          class="p-2"
          :class="{
            'text-body-tertiary': day.isOtherMonth,
            'fw-bold text-primary': isDayToday(day.date),
          }"
        >
          {{ formatDay(day.date) }}
        </div>

        <!-- Events -->
        <div class="flex-grow-1 overflow-auto">
          <div class="event-pill mb-1">
            <small class="badge bg-primary text-dark w-100 text-start text-white"> test </small>
            <small class="badge bg-primary text-dark w-100 text-start text-white"> test </small>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { generateCalendarDays } from '@/services/calendarService'
import { format, isSameDay } from 'date-fns'

export default {
  name: 'MonthCalendar',
  props: {
    currentDate: {
      type: Date,
      required: true,
      default() {
        return new Date()
      },
    },
  },
  data() {
    return {
      weeks: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    }
  },
  computed: {
    /**
     * @todo
     * make this dynamic and modular
     */
    daysInCalendar() {
      return generateCalendarDays(this.currentDate)
    },
  },
  methods: {
    formatDay(day) {
      return format(day, 'd')
    },
    isDayToday(date) {
      const today = new Date()
      return isSameDay(date, today)
    },
  },
}
</script>

<style scoped>
.calendarGrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.day-cell {
  min-height: 120px;
}
</style>
