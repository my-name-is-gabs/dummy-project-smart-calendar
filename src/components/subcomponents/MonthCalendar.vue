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
        class="day-cell border border-secondary-subtle ps-2"
        v-for="(day, i) in daysInCalendar"
        :key="i"
      >
        {{ formatDay(day.date) }}
      </div>
    </div>
  </main>
</template>

<script>
import { format } from 'date-fns'

export default {
  name: 'MonthCalendar',
  props: {
    daysInCalendar: {
      type: Array,
      required: true,
      default() {
        return ['1']
      },
    },
  },
  data() {
    return {
      weeks: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    }
  },
  methods: {
    formatDay(day) {
      return format(day, 'd')
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
