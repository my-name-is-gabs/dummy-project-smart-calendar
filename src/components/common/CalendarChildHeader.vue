<template>
  <div class="calendar-child-header">
    <!-- Month View Header - Shows Week Day Labels -->
    <div v-if="!isWeekView" class="month-header d-flex">
      <div
        v-for="(dayName, index) in weekDayLabels"
        :key="index"
        class="day-label text-center py-2 fw-bold border-bottom border-secondary flex-fill"
      >
        {{ dayName }}
      </div>
    </div>

    <!-- Week View Header - Shows Full Dates -->
    <div v-else class="week-header d-flex">
      <div
        v-for="(day, index) in weekDays"
        :key="index"
        class="day-header text-center py-2 fw-bold border-bottom border-secondary flex-fill"
        :class="{
          today: day.isToday,
          'current-month': day.isCurrentMonth,
          'different-month': !day.isCurrentMonth,
        }"
      >
        <div class="day-name">{{ day.dayName }}</div>
        <div class="date-number">{{ day.dateNumber }}</div>
        <div v-if="showMonthInWeek && !day.isCurrentMonth" class="month-name small">
          {{ day.monthName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameMonth } from 'date-fns'

export default {
  name: 'CalendarChildHeader',
  props: {
    // Current date to display (for both month and week views)
    currentDate: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    // View type: 'month' or 'week'
    viewType: {
      type: String,
      default: 'month',
      validator: (value) => ['month', 'week'].includes(value),
    },
    // Custom day names for both views (optional)
    dayNames: {
      type: Array,
      default: () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    // Week starts on (0 = Sunday, 1 = Monday, etc.)
    weekStartsOn: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 6,
    },
    // Show month name in week view for days from different months
    showMonthInWeek: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    isWeekView() {
      return this.viewType === 'week'
    },

    weekDayLabels() {
      // For month view, we show the day names (Sun, Mon, Tue, etc.)
      const labels = []
      const startIndex = this.weekStartsOn

      // Generate the day labels in the correct order based on weekStartsOn
      for (let i = 0; i < 7; i++) {
        const index = (startIndex + i) % 7
        labels.push(this.dayNames[index])
      }

      return labels
    },

    weekDays() {
      if (!this.isWeekView) return []

      const start = startOfWeek(this.currentDate, { weekStartsOn: this.weekStartsOn })
      const end = endOfWeek(this.currentDate, { weekStartsOn: this.weekStartsOn })
      const days = eachDayOfInterval({ start, end })

      return days.map((date) => ({
        date,
        dayName: this.dayNames[date.getDay()],
        dateNumber: format(date, 'd'),
        monthName: format(date, 'MMM'),
        isToday: isToday(date),
        isCurrentMonth: isSameMonth(date, this.currentDate),
      }))
    },
  },
}
</script>

<style scoped>
.calendar-child-header {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Month View Styles */
.month-header {
  background-color: #f8f9fa;
  min-height: 60px;
}

.day-label {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  color: #6c757d;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.day-label:last-child {
  border-right: none;
}

/* Week View Styles */
.week-header {
  background-color: #f8f9fa;
  min-height: 80px;
}

.day-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 80px;
  border-right: 1px solid #dee2e6;
  transition: background-color 0.2s ease;
  position: relative;
}

.day-header:last-child {
  border-right: none;
}

.day-header.today {
  background-color: #e3f2fd;
  color: #1976d2;
}

.day-header.today .date-number {
  background-color: #1976d2;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}

.day-header.different-month {
  color: #6c757d;
  opacity: 0.8;
}

.day-header.current-month {
  color: #2c3e50;
}

.day-name {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-number {
  font-size: 1.5rem;
  font-weight: 400;
  margin-top: 2px;
}

.month-name {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 0.7rem;
  color: #6c757d;
}

/* Responsive design */
@media (max-width: 768px) {
  .month-header {
    min-height: 50px;
  }

  .day-label {
    min-height: 50px;
    font-size: 0.75rem;
    padding: 0.5rem 0.25rem;
  }

  .week-header {
    min-height: 70px;
  }

  .day-header {
    min-height: 70px;
    padding: 0.5rem 0.25rem;
  }

  .day-name {
    font-size: 0.75rem;
  }

  .date-number {
    font-size: 1.125rem;
  }

  .month-name {
    font-size: 0.65rem;
    top: 2px;
    right: 2px;
  }
}

@media (max-width: 576px) {
  .day-label {
    min-height: 45px;
    font-size: 0.7rem;
  }

  .day-header {
    min-height: 60px;
  }

  .day-name {
    font-size: 0.7rem;
  }

  .date-number {
    font-size: 1rem;
  }

  .day-header.today .date-number {
    width: 28px;
    height: 28px;
  }

  .month-name {
    font-size: 0.6rem;
  }
}

.day-header:nth-child(1),
.day-header:nth-child(7) {
  background-color: #fff5f5;
}
</style>
