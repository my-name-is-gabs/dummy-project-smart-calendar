<template>
  <div class="container-fluid">
    <div class="card shadow-sm">
      <calendar-header
        :current-date="currentDate"
        :current-view="currentView"
        :navigation-style="'modern'"
        @date-navigator="handleDateNavigation"
        @view-change="handleViewChange"
        @today-click="handleTodayClick"
      >
      </calendar-header>

      <!-- Dynamic Calendar Component -->
      <component
        :is="currentCalendarComponent"
        :current-date="currentDate"
        :events="filteredEvents"
        v-bind="calendarComponentProps"
      ></component>
    </div>
  </div>
</template>

<script>
import { isSameDay, isSameWeek, isSameMonth } from 'date-fns'
import CalendarHeader from './subcomponents/CalendarHeader.vue'
import MonthCalendar from './subcomponents/MonthCalendar.vue'
import WeekCalendar from './subcomponents/WeekCalendar.vue'
import DayCalendar from './subcomponents/DayCalendar.vue' // You'll need to create this

export default {
  name: 'SmartCalendar',
  components: {
    CalendarHeader,
    MonthCalendar,
    WeekCalendar,
    DayCalendar,
  },
  props: {
    events: {
      type: Array,
      required: false,
      default: () => [
        {
          id: 1,
          title: 'Event 1',
          desc: 'This is a sample description',
          datetime: new Date(new Date().setHours(10, 0, 0, 0)),
          type: 'primary',
        },
        {
          id: 2,
          title: 'Meeting',
          desc: 'Team meeting',
          datetime: new Date(new Date().setDate(new Date().getDate() + 1)),
          type: 'success',
        },
      ],
    },
    initialView: {
      type: String,
      default: 'month',
      validator: (value) => ['day', 'week', 'month'].includes(value),
    },
    weekStartsOn: {
      type: Number,
      default: 0, // 0 = Sunday, 1 = Monday
      validator: (value) => [0, 1].includes(value),
    },
  },
  data() {
    return {
      currentDate: new Date(),
      currentView: this.initialView,
    }
  },
  computed: {
    currentCalendarComponent() {
      const componentMap = {
        day: 'DayCalendar',
        week: 'WeekCalendar',
        month: 'MonthCalendar',
      }
      return componentMap[this.currentView] || 'MonthCalendar'
    },

    calendarComponentProps() {
      const baseProps = {
        weekStartsOn: this.weekStartsOn,
      }

      // Add view-specific props if needed
      switch (this.currentView) {
        case 'week':
          return { ...baseProps, showWeekends: true }
        case 'month':
          return { ...baseProps, maxVisibleEvents: 3 }
        case 'day':
          return { ...baseProps, showTimeSlots: true }
        default:
          return baseProps
      }
    },

    filteredEvents() {
      // Filter events based on current view and date
      return this.events.filter((event) => {
        const eventDate = event.datetime || event.startDate || event.date

        switch (this.currentView) {
          case 'day':
            return isSameDay(eventDate, this.currentDate)
          case 'week':
            return isSameWeek(eventDate, this.currentDate, { weekStartsOn: this.weekStartsOn })
          case 'month':
            return isSameMonth(eventDate, this.currentDate)
          default:
            return true
        }
      })
    },
  },
  methods: {
    handleDateNavigation({ direction, view, currentDate }) {
      const newDate = new Date(currentDate)

      switch (direction) {
        case 'prev':
          this.navigateToPrevious(newDate, view)
          break
        case 'next':
          this.navigateToNext(newDate, view)
          break
      }
    },

    navigateToPrevious(date, view) {
      switch (view) {
        case 'month':
          date.setMonth(date.getMonth() - 1)
          break
        case 'week':
          date.setDate(date.getDate() - 7)
          break
        case 'day':
          date.setDate(date.getDate() - 1)
          break
      }
      this.currentDate = new Date(date)
    },

    navigateToNext(date, view) {
      switch (view) {
        case 'month':
          date.setMonth(date.getMonth() + 1)
          break
        case 'week':
          date.setDate(date.getDate() + 7)
          break
        case 'day':
          date.setDate(date.getDate() + 1)
          break
      }
      this.currentDate = new Date(date)
    },

    handleViewChange({ view, previousView, currentDate }) {
      this.currentView = view
      this.currentDate = new Date(currentDate)

      // Emit event for parent component if needed
      this.$emit('view-changed', {
        newView: view,
        previousView: previousView,
        currentDate: this.currentDate,
      })
    },

    handleTodayClick({ view, date }) {
      this.currentDate = new Date(date)
      this.currentView = view

      // Emit event for parent component if needed
      this.$emit('today-clicked', {
        view: view,
        date: this.currentDate,
      })
    },

    // Additional helper methods for event handling
    handleEventClick(event) {
      this.$emit('event-clicked', event)
    },

    handleEventDrop({ event, newDate, originalDate }) {
      this.$emit('event-moved', {
        event,
        newDate,
        originalDate,
      })
    },

    handleDayClick(dayData) {
      this.$emit('day-clicked', dayData)
    },
  },

  emits: ['view-changed', 'today-clicked', 'event-clicked', 'event-moved', 'day-clicked'],

  // Lifecycle hook to initialize with current date
  mounted() {
    console.log('SmartCalendar mounted with view:', this.currentView)
  },
}
</script>

<style scoped>
.card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.container-fluid {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* Smooth transitions for calendar switching */
.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.3s ease;
}

.component-fade-enter-from,
.component-fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container-fluid {
    padding: 10px;
  }
}
</style>
