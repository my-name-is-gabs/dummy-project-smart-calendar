<template>
  <div class="week-calendar">
    <!-- Calendar Header with Days -->
    <div class="calendar-header border-bottom">
      <div class="row g-0">
        <!-- Time column header -->
        <div class="col-1 time-column-header border-end bg-light"></div>
        <!-- Day headers -->
        <div
          v-for="day in weekDays"
          :key="day.date.toString()"
          class="col day-header text-center py-2 border-end"
          :class="{
            'bg-primary text-white': day.isToday,
            'bg-light': !day.isToday,
          }"
        >
          <div class="fw-bold text-uppercase small">{{ day.dayName }}</div>
          <div
            class="date-badge"
            :class="{
              'badge bg-white text-primary rounded-circle': day.isToday,
              'fs-6': !day.isToday,
            }"
          >
            {{ day.dateNumber }}
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar Body with Hours Grid -->
    <div class="calendar-body" style="height: calc(100vh - 120px); overflow-y: auto">
      <div class="row g-0">
        <!-- Time Labels Column -->
        <div class="col-1 time-column border-end">
          <div
            v-for="hour in hours"
            :key="hour"
            class="time-label border-bottom py-2 text-end pe-2"
          >
            <small class="text-muted fw-medium">{{ formatHour(hour) }}</small>
          </div>
        </div>

        <!-- Days Grid -->
        <div class="col days-grid">
          <div class="row g-0 h-100">
            <div
              v-for="day in weekDays"
              :key="day.date.toString()"
              class="col day-column border-end position-relative"
            >
              <!-- Hour slots -->
              <div
                v-for="hour in hours"
                :key="hour"
                class="hour-slot border-bottom"
                :class="{
                  'bg-light': hour % 2 === 0,
                  'bg-white': hour % 2 !== 0,
                }"
                @click="handleSlotClick(day.date, hour)"
              >
                <!-- Events will be rendered here -->
                <div
                  v-for="event in getEventsForSlot(day.date, hour)"
                  :key="event.id"
                  class="event-item small p-1 mb-1 rounded text-white"
                  :class="`bg-${event.type || 'primary'}`"
                >
                  <div class="fw-bold">{{ event.title }}</div>
                  <small>{{ formatTime(event.datetime) }}</small>
                </div>
              </div>

              <!-- Current time indicator -->
              <div
                v-if="day.isToday && currentTimeIndicator.position"
                class="current-time-indicator position-absolute start-0 end-0 bg-danger"
                :style="{ top: currentTimeIndicator.position + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  setHours,
  setMinutes,
  isSameDay,
  getHours,
  getMinutes,
} from 'date-fns'

export default {
  name: 'WeekCalendar',

  props: {
    /**
     * The current date to display in the calendar
     */
    currentDate: {
      type: Date,
      default: () => new Date(),
    },

    /**
     * Array of events to display on the calendar
     */
    events: {
      type: Array,
      default: () => [],
    },

    /**
     * Whether to use 12-hour format (AM/PM) instead of 24-hour format
     */
    hourFormat12: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      hours: Array.from({ length: 24 }, (_, i) => i),
      currentTime: new Date(),
      currentTimeIndicator: { position: null },
      draggedEvent: null,
      timeInterval: null,
    }
  },

  emits: ['slot-click', 'event-drop'],

  mounted() {
    this.initializeCurrentTimeUpdater()
  },

  beforeUnmount() {
    this.clearTimeInterval()
  },

  computed: {
    /**
     * Array of days for the current week with their details
     * @returns {Array<Object>} Array of day objects with date information
     */
    weekDays() {
      const start = startOfWeek(this.currentDate, { weekStartsOn: 0 }) // Sunday
      const end = endOfWeek(this.currentDate, { weekStartsOn: 0 }) // Saturday
      const days = eachDayOfInterval({ start, end })

      return days.map((date) => ({
        date,
        dayName: format(date, 'EEE'),
        dateNumber: format(date, 'd'),
        month: format(date, 'MMM'),
        isToday: isToday(date),
        isCurrentMonth: format(date, 'MM') === format(this.currentDate, 'MM'),
      }))
    },
  },

  methods: {
    /**
     * Format hour based on 12 or 24 hour format
     * @param {number} hour - The hour to format (0-23)
     * @returns {string} Formatted hour string
     */
    formatHour(hour) {
      if (this.hourFormat12) {
        if (hour === 0) return '12 AM'
        if (hour === 12) return '12 PM'
        return hour > 12 ? `${hour - 12} PM` : `${hour} AM`
      }
      return `${hour.toString().padStart(2, '0')}:00`
    },

    /**
     * Format a date to display time
     * @param {Date} date - The date to format
     * @returns {string} Formatted time string
     */
    formatTime(date) {
      return format(date, this.hourFormat12 ? 'h:mm a' : 'HH:mm')
    },

    /**
     * Handle when a time slot is clicked
     * @param {Date} date - The date of the clicked slot
     * @param {number} hour - The hour of the clicked slot
     */
    handleSlotClick(date, hour) {
      const clickedDateTime = setMinutes(setHours(date, hour), 0)
      this.$emit('slot-click', clickedDateTime)
    },

    /**
     * Get events for a specific time slot
     * @param {Date} date - The date to check
     * @param {number} hour - The hour to check
     * @returns {Array} Array of events for that time slot
     */
    getEventsForSlot(date, hour) {
      return this.events.filter((event) => {
        const eventHour = getHours(event.datetime)
        return isSameDay(event.datetime, date) && eventHour === hour
      })
    },

    /**
     * Update the current time and position indicator
     */
    updateCurrentTime() {
      this.currentTime = new Date()

      // Update current time indicator position
      if (this.currentTime) {
        const currentMinute = getMinutes(this.currentTime)
        const currentHour = getHours(this.currentTime)
        const position = ((currentHour + currentMinute / 60) / 24) * 100
        this.currentTimeIndicator.position = position
      }
    },

    /**
     * Initialize the current time updater interval
     */
    initializeCurrentTimeUpdater() {
      this.updateCurrentTime()
      // Update current time every minute
      this.timeInterval = setInterval(this.updateCurrentTime, 60000)
    },

    /**
     * Clear the time update interval
     */
    clearTimeInterval() {
      if (this.timeInterval) {
        clearInterval(this.timeInterval)
        this.timeInterval = null
      }
    },
  },
}
</script>

<style scoped>
.week-calendar {
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.calendar-header {
  background-color: #f8f9fa;
}

.time-column-header {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-header {
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.date-badge {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}

.time-column {
  background-color: #f8f9fa;
}

.time-label {
  height: 60px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.days-grid {
  background-color: white;
}

.day-column {
  min-height: 1440px; /* 24 hours * 60px */
}

.hour-slot {
  height: 60px;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  position: relative;
}

.hour-slot:hover {
  background-color: #e7f3ff !important;
}

.hour-slot:active {
  background-color: #d0e7ff !important;
}

.event-item {
  font-size: 0.75rem;
  border-left: 3px solid rgba(0, 0, 0, 0.2);
}

.event-item:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.current-time-indicator {
  height: 2px;
  z-index: 10;
}

.current-time-indicator::before {
  content: '';
  position: absolute;
  left: -4px;
  top: -3px;
  width: 8px;
  height: 8px;
  background-color: #dc3545;
  border-radius: 50%;
}

/* Scrollbar styling */
.calendar-body::-webkit-scrollbar {
  width: 8px;
}

.calendar-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.calendar-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.calendar-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
