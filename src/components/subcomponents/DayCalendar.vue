<template>
  <main class="day-calendar-container">
    <!-- Dynamic Header Component -->
    <calendar-child-header
      :current-date="currentDate"
      view-type="day"
      :day-names="weekDayNames"
      :week-starts-on="weekStartsOn"
    />

    <!-- Day Calendar Layout -->
    <div class="day-calendar-content">
      <!-- Time Column & Events Grid -->
      <div class="time-events-grid">
        <!-- Time Labels Column -->
        <div class="time-column">
          <div class="time-header"></div>
          <div
            v-for="hour in hours"
            :key="hour"
            class="time-slot-label"
            :class="{ 'current-hour': isCurrentHour(hour) }"
          >
            <small class="text-muted fw-medium">{{ formatHour(hour) }}</small>
          </div>
        </div>

        <!-- Events Column -->
        <div class="events-column">
          <!-- All Day Events Section -->
          <div v-if="allDayEvents.length > 0" class="all-day-events-section border-bottom">
            <div class="all-day-header py-2 px-3 bg-light">
              <small class="text-muted fw-bold">ALL DAY</small>
            </div>
            <div class="all-day-events p-2">
              <div
                v-for="event in allDayEvents"
                :key="event.id"
                class="all-day-event mb-1"
                :class="`event-${event.type || 'primary'}`"
                @click="handleEventClick(event)"
              >
                <div class="event-content p-2 text-white rounded">
                  <strong class="event-title">{{ event.title }}</strong>
                  <small v-if="event.desc" class="event-desc d-block opacity-75">{{
                    event.desc
                  }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Hourly Time Slots -->
          <div class="hourly-slots">
            <div
              v-for="hour in hours"
              :key="hour"
              class="hour-slot"
              :class="{
                'current-hour': isCurrentHour(hour),
                'past-hour': isPastHour(hour),
                'future-hour': isFutureHour(hour),
              }"
              @click="handleHourClick(hour)"
              @dragover="handleDragOver"
              @drop="handleEventDrop(hour, $event)"
            >
              <!-- Events for this hour -->
              <div class="hour-events">
                <div
                  v-for="event in getEventsForHour(hour)"
                  :key="event.id"
                  class="timed-event"
                  :class="`event-${event.type || 'primary'}`"
                  :style="getEventStyle(event)"
                  draggable="true"
                  @dragstart="handleEventDragStart(event, $event)"
                  @click.stop="handleEventClick(event)"
                >
                  <div class="event-content p-1 text-white rounded">
                    <div class="event-title small fw-bold">{{ event.title }}</div>
                    <div class="event-time x-small opacity-75">
                      {{ formatEventTime(event) }}
                    </div>
                    <div v-if="event.desc" class="event-desc x-small opacity-75">
                      {{ event.desc }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Current Time Indicator -->
              <div
                v-if="isCurrentHour(hour) && currentTimeIndicator.position"
                class="current-time-indicator"
                :style="{ top: currentTimeIndicator.position + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar for Event Details (Optional) -->
      <div v-if="selectedEvent" class="event-sidebar border-start">
        <div class="sidebar-header p-3 border-bottom">
          <h6 class="mb-0">Event Details</h6>
          <button class="btn-close" @click="selectedEvent = null"></button>
        </div>
        <div class="sidebar-content p-3">
          <h5>{{ selectedEvent.title }}</h5>
          <p class="text-muted" v-if="selectedEvent.desc">{{ selectedEvent.desc }}</p>
          <div class="event-meta">
            <small class="d-block">
              <i class="bi bi-clock me-2"></i>
              {{ formatEventTime(selectedEvent) }}
            </small>
            <small class="d-block mt-1">
              <i class="bi bi-calendar me-2"></i>
              {{ format(selectedEvent.datetime, 'EEEE, MMMM d, yyyy') }}
            </small>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import {
  format,
  isSameDay,
  getHours,
  getMinutes,
  isToday as isTodayDate,
  startOfHour,
  setHours,
  setMinutes,
} from 'date-fns'
import CalendarChildHeader from '../common/CalendarChildHeader.vue'

export default {
  name: 'DayCalendar',
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
      default: () => [
        {
          id: 1,
          title: 'Morning Meeting',
          desc: 'Daily standup with team',
          datetime: new Date(new Date().setHours(9, 0, 0, 0)),
          endTime: new Date(new Date().setHours(10, 0, 0, 0)),
          type: 'primary',
        },
        {
          id: 2,
          title: 'Evening Workout',
          desc: 'Gym session and cooldown',
          datetime: new Date(new Date().setHours(18, 45, 0, 0)),
          endTime: new Date(new Date().setHours(20, 0, 0, 0)),
          type: 'success',
        },
      ],
    },
    weekStartsOn: {
      type: Number,
      default: 0,
      validator: (value) => [0, 1].includes(value),
    },
    weekDayNames: {
      type: Array,
      default: () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    hourFormat12: {
      type: Boolean,
      default: true,
    },
    showAllDaySection: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      hours: Array.from({ length: 24 }, (_, i) => i), // 0-23 hours
      currentTime: new Date(),
      currentTimeIndicator: { position: null },
      selectedEvent: null,
      timeInterval: null,
    }
  },
  computed: {
    allDayEvents() {
      return this.events.filter((event) => {
        if (!isSameDay(event.datetime, this.currentDate)) return false
        return event.isAllDay || this.isMultiHourEvent(event)
      })
    },

    timedEvents() {
      return this.events.filter((event) => {
        if (!isSameDay(event.datetime, this.currentDate)) return false
        return !this.allDayEvents.includes(event)
      })
    },
  },
  emits: ['event-click', 'event-drag', 'event-drop', 'hour-click', 'event-select'],
  methods: {
    formatHour(hour) {
      if (this.hourFormat12) {
        if (hour === 0) return '12 AM'
        if (hour === 12) return '12 PM'
        return hour > 12 ? `${hour - 12} PM` : `${hour} AM`
      }
      return `${hour.toString().padStart(2, '0')}:00`
    },

    formatEventTime(event) {
      const start = event.datetime
      const end = event.endTime

      if (end) {
        return `${format(start, this.hourFormat12 ? 'h:mm a' : 'HH:mm')} - ${format(end, this.hourFormat12 ? 'h:mm a' : 'HH:mm')}`
      }
      return format(start, this.hourFormat12 ? 'h:mm a' : 'HH:mm')
    },

    isCurrentHour(hour) {
      const now = new Date()
      return isSameDay(now, this.currentDate) && getHours(now) === hour
    },

    isPastHour(hour) {
      const now = new Date()
      return isSameDay(now, this.currentDate) && hour < getHours(now)
    },

    isFutureHour(hour) {
      const now = new Date()
      return isSameDay(now, this.currentDate) && hour > getHours(now)
    },

    isMultiHourEvent(event) {
      if (!event.endTime) return false

      const startHour = getHours(event.datetime)
      const endHour = getHours(event.endTime)
      return endHour - startHour >= 6 // Consider events spanning 6+ hours as "all day"
    },

    getEventsForHour(hour) {
      return this.timedEvents.filter((event) => {
        const eventHour = getHours(event.datetime)
        return eventHour === hour
      })
    },

    getEventStyle(event) {
      const style = {}

      // Calculate event position and height based on start time and duration
      if (event.endTime) {
        const startMinutes = getHours(event.datetime) * 60 + getMinutes(event.datetime)
        const endMinutes = getHours(event.endTime) * 60 + getMinutes(event.endTime)
        const duration = Math.max(endMinutes - startMinutes, 30) // Minimum 30 minutes

        // Position from top of the hour slot (0-100%)
        const startPosition = (getMinutes(event.datetime) / 60) * 100
        // Height as percentage of hour slot
        const height = Math.min((duration / 60) * 100, 100)

        style.top = `${startPosition}%`
        style.height = `${height}%`
      } else {
        // Default for events without end time
        style.top = '0%'
        style.height = '50%'
      }

      return style
    },

    handleHourClick(hour) {
      const clickedTime = setMinutes(setHours(new Date(this.currentDate), hour), 0)
      this.$emit('hour-click', {
        hour,
        time: clickedTime,
        date: this.currentDate,
      })
    },

    handleEventClick(event) {
      this.selectedEvent = event
      this.$emit('event-click', event)
      this.$emit('event-select', event)
    },

    handleEventDragStart(event, dragEvent) {
      dragEvent.dataTransfer.setData('text/plain', event.id)
      this.$emit('event-drag', { event, dragEvent })
    },

    handleDragOver(dragEvent) {
      dragEvent.preventDefault()
    },

    handleEventDrop(hour, dropEvent) {
      dropEvent.preventDefault()
      const eventId = dropEvent.dataTransfer.getData('text/plain')
      const event = this.events.find((e) => e.id === eventId)

      if (event) {
        const newDateTime = new Date(this.currentDate)
        newDateTime.setHours(hour, getMinutes(event.datetime), 0, 0)

        this.$emit('event-drop', {
          event,
          newDateTime,
          originalDateTime: event.datetime,
        })
      }
    },

    updateCurrentTime() {
      this.currentTime = new Date()

      // Update current time indicator position
      if (isSameDay(this.currentTime, this.currentDate)) {
        const currentMinute = getMinutes(this.currentTime)
        const position = (currentMinute / 60) * 100
        this.currentTimeIndicator.position = position
      } else {
        this.currentTimeIndicator.position = null
      }
    },

    initializeCurrentTimeUpdater() {
      this.updateCurrentTime()
      this.timeInterval = setInterval(this.updateCurrentTime, 30000) // Update every 30 seconds
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
}
</script>

<style scoped>
.day-calendar-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  height: calc(100vh - 120px);
}

.day-calendar-content {
  display: flex;
  height: 100%;
}

.time-events-grid {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Time Column */
.time-column {
  width: 80px;
  min-width: 80px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
}

.time-header {
  height: 60px;
  border-bottom: 1px solid #dee2e6;
}

.time-slot-label {
  height: 60px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 8px 12px 0 0;
  border-bottom: 1px solid #e9ecef;
  position: relative;
}

.time-slot-label.current-hour {
  background-color: #e7f3ff;
}

/* Events Column */
.events-column {
  flex: 1;
  overflow-y: auto;
}

.all-day-events-section {
  background: white;
}

.all-day-header {
  border-bottom: 1px solid #dee2e6;
}

.all-day-event {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.all-day-event:hover {
  transform: translateX(4px);
}

/* Hourly Slots */
.hourly-slots {
  position: relative;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid #e9ecef;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.hour-slot:hover {
  background-color: #f8f9fa;
}

.hour-slot.current-hour {
  background-color: #e7f3ff;
}

.hour-slot.past-hour {
  background-color: #f8f9fa;
  opacity: 0.7;
}

/* Timed Events - FIXED STYLING */
.hour-events {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 8px;
}

.timed-event {
  position: absolute;
  left: 8px;
  right: 8px;
  min-height: 20px;
  max-height: 90%;
  z-index: 2;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timed-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.event-content {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.event-title {
  font-size: 0.75rem;
  line-height: 1.2;
  margin-bottom: 1px;
}

.event-time {
  font-size: 0.65rem;
  line-height: 1.1;
}

.event-desc {
  font-size: 0.65rem;
  line-height: 1.1;
  margin-top: 1px;
}

.x-small {
  font-size: 0.65rem !important;
}

/* Current Time Indicator */
.current-time-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #dc3545;
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

/* Event Sidebar */
.event-sidebar {
  width: 300px;
  min-width: 300px;
  background: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

/* Event Type Colors */
.event-primary .event-content {
  background: #0d6efd;
}
.event-secondary .event-content {
  background: #6c757d;
}
.event-success .event-content {
  background: #198754;
}
.event-danger .event-content {
  background: #dc3545;
}
.event-warning .event-content {
  background: #ffc107;
  color: #000;
}
.event-info .event-content {
  background: #0dcaf0;
  color: #000;
}
.event-default .event-content {
  background: #6c757d;
}

/* Responsive Design */
@media (max-width: 768px) {
  .time-column {
    width: 60px;
    min-width: 60px;
  }

  .time-slot-label {
    padding: 6px 8px 0 0;
    font-size: 0.875rem;
  }

  .event-sidebar {
    width: 250px;
    min-width: 250px;
  }

  .event-title {
    font-size: 0.7rem;
  }

  .event-time,
  .event-desc {
    font-size: 0.6rem;
  }
}

@media (max-width: 576px) {
  .day-calendar-content {
    flex-direction: column;
  }

  .event-sidebar {
    width: 100%;
    min-width: 100%;
    height: 300px;
  }

  .time-column {
    display: none;
  }
}

/* Scrollbar Styling */
.events-column::-webkit-scrollbar {
  width: 6px;
}

.events-column::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.events-column::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.events-column::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
