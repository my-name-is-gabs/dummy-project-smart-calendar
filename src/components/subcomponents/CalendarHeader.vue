<template>
  <header class="card-header bg-light border-bottom">
    <div class="d-flex align-items-center justify-content-between py-3">
      <!-- Left Section: Navigation & Date Display -->
      <div class="d-flex align-items-center gap-3">
        <!-- Today Button -->
        <button class="btn btn-outline-primary rounded-pill px-4" @click="emitToday">
          <i class="bi bi-calendar-check me-2"></i>
          {{ labels.todayButton }}
        </button>

        <!-- Navigation Buttons -->
        <div class="btn-group">
          <button
            class="btn btn-outline-secondary"
            @click="emitNavigatorLeft"
            :title="`Previous ${currentView}`"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          <button
            class="btn btn-outline-secondary"
            @click="emitNavigatorRight"
            :title="`Next ${currentView}`"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>

        <!-- Current Date Display -->
        <div class="current-date-display">
          <h4 class="mb-0 text-dark fw-bold">{{ formattedDate }}</h4>
        </div>
      </div>

      <!-- Right Section: View Selector -->
      <div class="d-flex align-items-center gap-3">
        <!-- View Type Selector -->
        <div class="view-selector">
          <select class="form-select" v-model="selectedView" @change="handleViewChange">
            <option v-for="option in calendarOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { format, startOfWeek, endOfWeek } from 'date-fns'

export default {
  name: 'CalendarHeader',
  props: {
    currentDate: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    currentView: {
      type: String,
      required: true,
      default: 'month',
      validator: (value) => ['day', 'week', 'month'].includes(value),
    },
    showViewInfo: {
      type: Boolean,
      default: true,
    },
    dateFormat: {
      type: Object,
      default: () => ({
        month: 'MMMM yyyy',
        week: 'MMM d, yyyy',
        day: 'EEEE, MMMM d, yyyy',
      }),
    },
    customLabels: {
      type: Object,
      default: null,
    },
    customCalendarOptions: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      selectedView: this.currentView,
      defaultLabels: {
        todayButton: 'Today',
        toggle: {
          left: '‹',
          right: '›',
        },
      },
      defaultCalendarOptions: [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ],
    }
  },
  computed: {
    labels() {
      return this.customLabels
        ? { ...this.defaultLabels, ...this.customLabels }
        : this.defaultLabels
    },

    calendarOptions() {
      return this.customCalendarOptions || this.defaultCalendarOptions
    },

    formattedDate() {
      switch (this.currentView) {
        case 'month':
          return format(this.currentDate, this.dateFormat.month)

        case 'week':
          const weekStart = startOfWeek(this.currentDate, { weekStartsOn: 0 })
          const weekEnd = endOfWeek(this.currentDate, { weekStartsOn: 0 })

          if (format(weekStart, 'MMM yyyy') === format(weekEnd, 'MMM yyyy')) {
            return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`
          } else if (format(weekStart, 'yyyy') === format(weekEnd, 'yyyy')) {
            return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
          } else {
            return `${format(weekStart, 'MMM d, yyyy')} - ${format(weekEnd, 'MMM d, yyyy')}`
          }

        case 'day':
          return format(this.currentDate, this.dateFormat.day)

        default:
          return format(this.currentDate, 'MMMM yyyy')
      }
    },
  },
  emits: ['date-navigator', 'view-change', 'today-click'],
  watch: {
    currentView(newView) {
      this.selectedView = newView
    },
  },
  methods: {
    emitNavigatorLeft() {
      this.$emit('date-navigator', {
        direction: 'prev',
        view: this.currentView,
        currentDate: this.currentDate,
      })
    },

    emitNavigatorRight() {
      this.$emit('date-navigator', {
        direction: 'next',
        view: this.currentView,
        currentDate: this.currentDate,
      })
    },

    emitToday() {
      this.$emit('today-click', {
        view: this.currentView,
        date: new Date(),
      })
    },

    handleViewChange() {
      this.$emit('view-change', {
        view: this.selectedView,
        previousView: this.currentView,
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
