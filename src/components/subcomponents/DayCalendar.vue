<template>
  <div class="day-calendar">
    <!-- Calendar Body -->
    <div class="calendar-body" style="height: calc(100vh - 120px); overflow-y: auto">
      <div class="row g-0">
        <!-- Time Labels Column -->
        <div class="col-1 time-column border-end bg-light">
          <div
            v-for="hour in hours"
            :key="hour"
            class="time-label border-bottom py-2 text-end pe-2"
          >
            <small class="text-muted fw-medium">{{ formatHour(hour) }}</small>
          </div>
        </div>

        <!-- Main Day Grid -->
        <div class="col day-grid position-relative">
          <!-- Hour slots -->
          <div
            v-for="hour in hours"
            :key="hour"
            class="hour-slot border-bottom"
            :class="{
              'bg-light': hour % 2 === 0,
              'bg-white': hour % 2 !== 0,
            }"
            @click="handleSlotClick(hour)"
          >
            <!-- Events will be rendered here -->
            <div
              v-for="event in getEventsForHour(hour)"
              :key="event.id"
              class="event-item small p-1 mb-1 rounded text-white"
              :class="`bg-${event.type || 'primary'}`"
            >
              <div class="fw-bold">{{ event.title }}</div>
              <small>{{ formatTime(event.datetime) }}</small>
            </div>
          </div>

          <!-- Current time indicator - THIS IS WHAT WAS MISSING -->
          <div
            v-if="currentTimeIndicator.position !== null && isToday(currentDate)"
            class="current-time-indicator position-absolute start-0 end-0 bg-danger"
            :style="{ top: currentTimeIndicator.position + '%' }"
          >
            <div class="current-time-label bg-danger text-white small px-2 py-1 rounded">
              {{ formatTime(currentTime) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format, isToday, isSameDay, setHours, setMinutes, getHours, getMinutes } from 'date-fns'

export default {
  name: 'DayCalendar',

  props: {
    currentDate: {
      type: Date,
      default: () => new Date(),
    },
    events: {
      type: Array,
      default: () => [],
    },
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
      timeInterval: null,
    }
  },

  methods: {
    formatHour(hour) {
      if (this.hourFormat12) {
        if (hour === 0) return '12 AM'
        if (hour === 12) return '12 PM'
        return hour > 12 ? `${hour - 12} PM` : `${hour} AM`
      }
      return `${hour.toString().padStart(2, '0')}:00`
    },

    formatTime(date) {
      return format(date, this.hourFormat12 ? 'h:mm a' : 'HH:mm')
    },

    formatDateHeader(date) {
      return format(date, 'EEEE, MMMM d, yyyy')
    },

    isToday(date) {
      return isToday(date)
    },

    handleSlotClick(hour) {
      const clickedDateTime = setMinutes(setHours(this.currentDate, hour), 0)
      this.$emit('slot-click', clickedDateTime)
    },

    // FIXED THIS METHOD - was using isToday instead of isSameDay
    getEventsForHour(hour) {
      return this.events.filter((event) => {
        const eventHour = getHours(event.datetime)
        // Use isSameDay to compare with currentDate, not isToday
        return isSameDay(event.datetime, this.currentDate) && eventHour === hour
      })
    },

    updateCurrentTime() {
      this.currentTime = new Date()

      if (this.currentTime && isToday(this.currentDate)) {
        const currentMinute = getMinutes(this.currentTime)
        const currentHour = getHours(this.currentTime)
        const position = ((currentHour + currentMinute / 60) / 24) * 100
        this.currentTimeIndicator.position = position
      } else {
        this.currentTimeIndicator.position = null
      }
    },

    initializeCurrentTimeUpdater() {
      this.updateCurrentTime()
      this.timeInterval = setInterval(this.updateCurrentTime, 60000)
    },

    clearTimeInterval() {
      if (this.timeInterval) {
        clearInterval(this.timeInterval)
        this.timeInterval = null
      }
    },
  },

  mounted() {
    this.initializeCurrentTimeUpdater()
  },

  beforeUnmount() {
    this.clearTimeInterval()
  },

  watch: {
    currentDate: {
      immediate: true,
      handler() {
        this.updateCurrentTime()
      },
    },
  },

  emits: ['slot-click'],
}
</script>

<style scoped>
.day-calendar {
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.calendar-header {
  background-color: #f8f9fa;
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

.day-grid {
  min-height: 1440px; /* 24 hours * 60px */
  background-color: white;
}

.hour-slot {
  height: 60px;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  position: relative;
  padding: 2px 4px; /* Add padding for events */
}

.hour-slot:hover {
  background-color: #e7f3ff !important;
}

/* Enhanced event styling */
.event-item {
  font-size: 0.75rem;
  border-left: 3px solid rgba(0, 0, 0, 0.2);
  cursor: pointer;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-item:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Event color variants */
.bg-primary {
  background-color: #007bff !important;
}
.bg-success {
  background-color: #28a745 !important;
}
.bg-warning {
  background-color: #ffc107 !important;
  color: #000 !important;
}
.bg-danger {
  background-color: #dc3545 !important;
}
.bg-info {
  background-color: #17a2b8 !important;
}
.bg-secondary {
  background-color: #6c757d !important;
}

.current-time-indicator {
  height: 2px;
  z-index: 10;
  pointer-events: none;
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

.current-time-label {
  position: absolute;
  left: 8px;
  top: -12px;
  transform: translateY(-100%);
}

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
</style>
