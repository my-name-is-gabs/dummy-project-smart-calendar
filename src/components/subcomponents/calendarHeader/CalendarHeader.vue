<template>
  <header class="card-header bg-light border-bottom">
    <div class="d-flex align-items-center justify-content-between py-3">
      <!-- Left Section: Navigation & Date Display -->
      <div class="d-flex align-items-center gap-3">
        <!-- Today Button -->
        <today-button :label="labels.todayButton" @today-click="emitToday" />

        <!-- Navigation Buttons -->
        <navigation-buttons
          :current-view="currentView"
          @navigate-left="emitNavigatorLeft"
          @navigate-right="emitNavigatorRight"
        />

        <!-- Current Date Display -->
        <date-display :formatted-date="formattedDate" />
      </div>

      <!-- Right Section: View Selector -->
      <div class="d-flex align-items-center gap-3">
        <!-- View Type Selector -->
        <view-selector
          :options="calendarOptions"
          :selected-view="selectedView"
          @view-change="handleViewChange"
        />
      </div>
    </div>
  </header>
</template>

<script>
import DateFormatterService from '@/services/dateFormatterService'
import ViewConfigService from '@/services/viewConfigService'
import NavigationButtons from './common/NavigationButtons.vue'
import DateDisplay from './common/DateDisplay.vue'
import ViewSelector from './common/ViewSelector.vue'
import TodayButton from './common/TodayButton.vue'

export default {
  name: 'CalendarHeader',
  components: {
    TodayButton,
    NavigationButtons,
    DateDisplay,
    ViewSelector,
  },
  props: {
    /**
     * The currently displayed date in the calendar
     */
    currentDate: {
      type: Date,
      required: true,
      default: () => new Date(),
    },

    /**
     * The current calendar view mode
     * @validValues 'day', 'week', 'month'
     */
    currentView: {
      type: String,
      required: true,
      default: 'month',
      validator: (value) => ViewConfigService.isValidView(value),
    },

    /**
     * Controls visibility of the view information display
     */
    showViewInfo: {
      type: Boolean,
      default: true,
    },

    /**
     * Custom date format patterns for different calendar views
     */
    dateFormat: {
      type: Object,
      default: () => ({
        month: 'MMMM yyyy',
        week: 'MMM d, yyyy',
        day: 'EEEE, MMMM d, yyyy',
      }),
    },

    /**
     * Custom UI labels to override default text content
     * @type {Object}
     */
    customLabels: {
      type: Object,
      default: null,
    },

    /**
     * Custom calendar view options to override default views
     */
    customCalendarOptions: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      selectedView: this.currentView,
      eventService: null,
    }
  },
  emits: ['date-navigator', 'view-change', 'today-click'],
  computed: {
    /**
     * Gets merged labels configuration with custom overrides
     * @returns {Object} Labels object
     */
    labels() {
      return ViewConfigService.getLabels(this.customLabels)
    },

    /**
     * Gets calendar view options with custom overrides
     * @returns {Array<Object>} Calendar options array
     */
    calendarOptions() {
      return ViewConfigService.getCalendarOptions(this.customCalendarOptions)
    },

    /**
     * Gets formatted date string for current view and date
     * @returns {string} Formatted date display
     */
    formattedDate() {
      const dateFormats = ViewConfigService.getDateFormats(this.dateFormat)
      return DateFormatterService.formatDateForView(this.currentDate, this.currentView, dateFormats)
    },
  },
  methods: {
    /**
     * Emits date navigation event for previous period
     */
    emitNavigatorLeft() {
      this.$emit('date-navigator', {
        direction: 'prev',
        view: this.currentView,
        currentDate: this.currentDate,
      })
    },

    /**
     * Emits date navigation event for next period
     */
    emitNavigatorRight() {
      this.$emit('date-navigator', {
        direction: 'next',
        view: this.currentView,
        currentDate: this.currentDate,
      })
    },

    /**
     * Emits today button click event
     */
    emitToday() {
      this.$emit('today-click', {
        view: this.currentView,
        date: new Date(),
      })
    },

    /**
     * Emits view change event when calendar view is switched
     */
    handleViewChange(view) {
      this.$emit('view-change', {
        view: view,
        currentDate: this.currentDate,
      })
    },
  },
}
</script>

<style scoped>
.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.current-date-display {
  min-width: 200px;
}

.view-selector {
  min-width: 120px;
}

.btn-group .btn {
  border-radius: 0.375rem;
  margin: 0 2px;
}

.btn-group .btn:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.btn-group .btn:last-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .d-flex {
    flex-direction: column;
    gap: 1rem !important;
  }

  .current-date-display {
    text-align: center;
    min-width: auto;
  }

  .view-selector {
    min-width: 100px;
  }
}

@media (max-width: 576px) {
  .btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .current-date-display h4 {
    font-size: 1.1rem;
  }
}

/* Smooth transitions */
.btn {
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}
</style>
