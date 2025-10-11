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
            'fw-bold current-day': isDayToday(day.date),
          }"
        >
          {{ formatDay(day.date) }}
        </div>

        <!-- Events -->
        <div class="flex-grow-1 overflow-auto">
          <div class="event-pill mb-1" v-for="(event, key) in events" :key="key">
            <small class="badge bg-info text-dark w-100 text-start text-white">
              {{ renderEventTitle(day.date, event) }}
            </small>
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
    events: {
      type: Array,
      required: true,
      default() {
        return []
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
     * @
     * make this dynamic and modular
     */
    daysInCalendar() {
      return generateCalendarDays(this.currentDate)
    },

    parseDate() {
      return dateTimeParserToString
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
    renderEventTitle(date, event) {
      const eventDate = event.datetime
      return isSameDay(date, eventDate) ? event.title : null
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
.current-day {
  position: relative;
  color: white;
  z-index: 1;
}

.current-day::after {
  position: absolute;
  content: '';
  background: #0d6efd;
  width: 29px;
  transform: translateX(-23px);
  height: 29px;
  z-index: -1;
  border-radius: 100%;
}
</style>
