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
import CalendarHeader from './subcomponents/CalendarHeader.vue'
import MonthCalendar from './subcomponents/MonthCalendar.vue'
import WeekCalendar from './subcomponents/WeekCalendar.vue'
import DayCalendar from './subcomponents/DayCalendar.vue'
import EventFilterService from '@/services/eventFilterService'
import ViewConfigManager from '@/config/viewConfigManager'
import { DAY_OFFSET, DAYS_IN_WEEK, MONTH_OFFSET } from '@/constants'

export default {
  name: 'SmartCalendar',
  components: {
    CalendarHeader,
    MonthCalendar,
    WeekCalendar,
    DayCalendar,
  },
  props: {
    /**
     * Array of calendar events to display
     * @type {Array<Object>}
     * @default
     * [{
     *   id: 1,
     *   title: 'Event 1',
     *   desc: 'This is a sample description',
     *   datetime: new Date('2025-01-15T10:00:00'),
     *   type: 'primary'
     * }]
     */
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

    /**
     * The initial calendar view to display
     * @type {string}
     * @default 'month'
     * @validValues 'day', 'week', 'month'
     */
    initialView: {
      type: String,
      default: 'month',
      validator: (value) => ViewConfigManager.isViewValid(value),
    },

    /**
     * The day the week starts on
     * @type {number}
     * @default 0
     * @validValues 0 (Sunday), 1 (Monday)
     */
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
  emits: ['view-changed', 'today-clicked', 'event-clicked', 'day-clicked'],
  computed: {
    /**
     * Gets the current calendar component name based on the active view.
     * @returns {string} The name of the Vue component for the current view
     */
    currentCalendarComponent() {
      return ViewConfigManager.getComponentName(this.currentView)
    },

    /**
     * Gets the props configuration for the current calendar component.
     * @returns {Object} The props object configured for the current view component
     */
    calendarComponentProps() {
      const baseProps = {
        weekStartsOn: this.weekStartsOn,
      }

      return ViewConfigManager.getComponentProps(this.currentView, baseProps)
    },

    /**
     * Gets events filtered by the current calendar view and date.
     * Uses EventFilterService to filter events based on day, week, or month view.
     * @returns {Array<Object>} An array of event objects filtered to match the current view and date
     * @see EventFilterService.filterEventsByView
     */
    filteredEvents() {
      return EventFilterService.filterEventsByView(
        this.events,
        this.currentDate,
        this.currentView,
        this.weekStartsOn,
      )
    },
  },
  methods: {
    /**
     * Handles date navigation based on direction and view
     * @param {Object} params - Navigation parameters
     * @param {'prev'|'next'} params.direction - Navigation direction
     * @param {'day'|'week'|'month'} params.view - Current calendar view
     * @param {Date} params.currentDate - Reference date for navigation
     */
    handleDateNavigation({ direction, view, currentDate }) {
      const newDate = new Date(currentDate)
      const navigationMapper = {
        prev: this.navigateToPrevious,
        next: this.navigateToNext,
      }

      const navigator = navigationMapper[direction]

      if (navigator) {
        navigator.call(this, newDate, view)
        this.currentDate = new Date(newDate)
      }
    },

    /**
     * Calculates the previous date based on view type
     * @param {Date} date - Date to modify
     * @param {'day'|'week'|'month'} view - Calendar view type
     */
    navigateToPrevious(date, view) {
      const navigationUnits = {
        day: () => date.setDate(date.getDate() - DAY_OFFSET),
        week: () => date.setDate(date.getDate() - DAYS_IN_WEEK),
        month: () => date.setMonth(date.getMonth() - MONTH_OFFSET),
      }

      const navigate = navigationUnits[view]

      if (navigate) navigate()
    },

    /**
     * Calculates the next date based on view type
     * @param {Date} date - Date to modify
     * @param {'day'|'week'|'month'} view - Calendar view type
     */
    navigateToNext(date, view) {
      const navigationUnits = {
        day: () => date.setDate(date.getDate() + DAY_OFFSET),
        week: () => date.setDate(date.getDate() + DAYS_IN_WEEK),
        month: () => date.setMonth(date.getMonth() + MONTH_OFFSET),
      }

      const navigate = navigationUnits[view]

      if (navigate) navigate()
    },

    /**
     * Handles calendar view changes and updates the current view/date
     * @param {Object} params - View change parameters
     * @param {'day'|'week'|'month'} params.view - The new calendar view to switch to
     * @param {Date} params.currentDate - The date to set as current date in the new view
     */
    handleViewChange({ view, currentDate }) {
      this.currentView = view
      this.currentDate = new Date(currentDate)
    },

    /**
     * Handles "Today" button click to navigate to current date in specified view
     * @param {Object} params - Today navigation parameters
     * @param {'day'|'week'|'month'} params.view - The view to show for today's date
     * @param {Date} params.date - The current date (typically today's date)
     */
    handleTodayClick({ view, date }) {
      this.currentDate = new Date(date)
      this.currentView = view
    },
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
