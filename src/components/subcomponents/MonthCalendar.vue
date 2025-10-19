<template>
  <main class="calendar-container">
    <!-- Dynamic Header Component -->
    <calendar-child-header
      :current-date="currentDate"
      view-type="month"
      :day-names="weekDayNames"
      :week-starts-on="weekStartsOn"
    />

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Days & Events -->
      <div
        class="day-cell border border-secondary-subtle position-relative d-flex flex-column"
        v-for="(day, index) in calendarDays"
        :key="`day-${index}-${day.date.getTime()}`"
        :class="{
          'other-month': day.isOtherMonth,
          'current-month': !day.isOtherMonth,
          today: isToday(day.date) && !day.isOtherMonth,
          'today-other-month': isToday(day.date) && day.isOtherMonth,
          weekend: isWeekend(day.date) && !day.isOtherMonth,
          'weekend-other-month': isWeekend(day.date) && day.isOtherMonth,
        }"
        @click="handleDayClick(day)"
      >
        <!-- Date Number -->
        <div class="day-header p-2">
          <span
            class="date-number"
            :class="{
              'text-muted opacity-50': day.isOtherMonth && !isToday(day.date),
              'text-body': !day.isOtherMonth && !isToday(day.date),
              'fw-bold text-white': isToday(day.date) && !day.isOtherMonth,
              'fw-bold text-primary': isToday(day.date) && day.isOtherMonth,
            }"
          >
            {{ formatDay(day.date) }}
          </span>
          <small
            v-if="isToday(day.date)"
            class="badge ms-1 today-badge"
            :class="day.isOtherMonth ? 'bg-light text-primary' : 'bg-primary'"
          >
            Today
          </small>
        </div>

        <!-- Events Container -->
        <div
          class="events-container flex-grow-1 p-1 overflow-auto"
          :class="{ 'opacity-50': day.isOtherMonth }"
        >
          <!-- Event Slots -->
          <slot name="event" :day="day" :events="getEventsForDay(day.date)">
            <!-- Default Event Display -->
            <div
              v-for="event in getEventsForDay(day.date)"
              :key="event.id"
              class="event-item mb-1"
              :class="`event-${event.type || 'default'}`"
              draggable="true"
              @dragstart="handleEventDragStart(event, $event)"
              @click.stop="handleEventClick(event)"
            >
              <small
                class="badge w-100 text-start text-truncate"
                :class="getEventBadgeClass(event)"
              >
                {{ event.title }}
              </small>
            </div>
          </slot>

          <!-- More Events Indicator -->
          <div
            v-if="hasMoreEvents(day.date)"
            class="more-events-indicator"
            @click.stop="handleMoreEventsClick(day.date)"
          >
            <small :class="day.isOtherMonth ? 'text-muted' : 'text-body'">
              +{{ getMoreEventsCount(day.date) }} more
            </small>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="getEventsForDay(day.date).length === 0"
          class="empty-day text-center"
          :class="day.isOtherMonth ? 'text-muted opacity-50' : 'text-muted'"
        >
          <small>No events</small>
        </div>

        <!-- Today indicator circle for current month -->
        <div v-if="isToday(day.date) && !day.isOtherMonth" class="today-indicator"></div>
      </div>
    </div>
  </main>
</template>

<script>
import { format, isSameDay, isToday as isTodayDate, isWeekend as isWeekendDate } from 'date-fns'
import { generateCalendarDays } from '@/services/calendarService'
import CalendarChildHeader from '../common/CalendarChildHeader.vue'

export default {
  name: 'MonthCalendar',
  components: {
    CalendarChildHeader,
  },
  props: {
    currentDate: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    events: {
      type: Array,
      required: false,
      default: () => [],
    },
    weekStartsOn: {
      type: Number,
      default: 0, // 0 = Sunday, 1 = Monday
      validator: (value) => [0, 1].includes(value),
    },
    weekDayNames: {
      type: Array,
      default: () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    maxVisibleEvents: {
      type: Number,
      default: 5,
    },
    showWeekends: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['day-click', 'event-click', 'more-events-click'],
  computed: {
    calendarDays() {
      return generateCalendarDays(this.currentDate, this.weekStartsOn)
    },
  },
  methods: {
    formatDay(date) {
      return format(date, 'd')
    },

    isToday(date) {
      return isTodayDate(date)
    },

    isWeekend(date) {
      return isWeekendDate(date)
    },

    getEventsForDay(date) {
      return this.events
        .filter((event) => isSameDay(event.datetime || event.startDate || event.date, date))
        .slice(0, this.maxVisibleEvents)
    },

    hasMoreEvents(date) {
      const dayEvents = this.events.filter((event) =>
        isSameDay(event.datetime || event.startDate || event.date, date),
      )
      return dayEvents.length > this.maxVisibleEvents
    },

    getMoreEventsCount(date) {
      const dayEvents = this.events.filter((event) =>
        isSameDay(event.datetime || event.startDate || event.date, date),
      )
      return Math.max(dayEvents.length - this.maxVisibleEvents, 0)
    },

    getEventBadgeClass(event) {
      const typeClasses = {
        primary: 'bg-primary text-white',
        secondary: 'bg-secondary text-white',
        success: 'bg-success text-white',
        danger: 'bg-danger text-white',
        warning: 'bg-warning text-dark',
        info: 'bg-info text-dark',
        default: 'bg-light text-dark',
      }
      return typeClasses[event.type] || typeClasses.default
    },

    handleDayClick(day) {
      this.$emit('day-click', {
        date: day.date,
        isOtherMonth: day.isOtherMonth,
        events: this.getEventsForDay(day.date),
      })
    },

    handleEventClick(event) {
      this.$emit('event-click', event)
    },

    handleMoreEventsClick(date) {
      const dayEvents = this.events.filter((event) =>
        isSameDay(event.datetime || event.startDate || event.date, date),
      )
      this.$emit('more-events-click', {
        date,
        events: dayEvents,
        hiddenCount: this.getMoreEventsCount(date),
      })
    },
  },
}
</script>

<style scoped>
.calendar-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #dee2e6;
}

.day-cell {
  min-height: 140px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.day-cell:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Current Month Days */
.day-cell.current-month {
  background: white;
}

.day-cell.current-month.weekend {
  background-color: #f8f9fa;
}

.day-cell.current-month.today {
  background-color: #e7f3ff;
}

/* Other Month Days - Grayed Out */
.day-cell.other-month {
  background-color: #f8f9fa;
  opacity: 0.6;
}

.day-cell.other-month:hover {
  background-color: #e9ecef;
  opacity: 0.8;
}

.day-cell.other-month.weekend-other-month {
  background-color: #f1f3f4;
}

.day-cell.other-month.today-other-month {
  background-color: #f0f7ff;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
  background: inherit;
}

.date-number {
  font-size: 1.1rem;
  font-weight: 500;
  position: relative;
  z-index: 2;
}

.today-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  position: relative;
  z-index: 2;
}

/* Today indicator circle */
.today-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  background: #0d6efd;
  border-radius: 50%;
  z-index: 1;
}

.events-container {
  max-height: 100px;
  min-height: 60px;
}

.event-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.event-item:hover {
  transform: translateX(2px);
}

.empty-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
}

.more-events-indicator {
  cursor: pointer;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.more-events-indicator:hover {
  background-color: #e9ecef;
}

/* Scrollbar styling for events container */
.events-container::-webkit-scrollbar {
  width: 4px;
}

.events-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.events-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.events-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive design */
@media (max-width: 768px) {
  .day-cell {
    min-height: 100px;
  }

  .date-number {
    font-size: 1rem;
  }

  .events-container {
    max-height: 80px;
  }

  .today-indicator {
    width: 24px;
    height: 24px;
    top: 6px;
    left: 6px;
  }
}

@media (max-width: 576px) {
  .calendar-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .day-cell {
    min-height: auto;
    height: 80px;
  }

  .today-badge {
    display: none;
  }

  .today-indicator {
    width: 20px;
    height: 20px;
    top: 4px;
    left: 4px;
  }
}

.day-cell.other-month .event-item {
  pointer-events: auto; /* Allow event interactions even in other months */
}

.day-cell.other-month .more-events-indicator {
  pointer-events: auto; /* Allow more events click */
}
</style>
