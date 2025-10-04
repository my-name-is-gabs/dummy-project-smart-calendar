<template>
  <div class="container-fluid">
    <div class="card shadow-sm">
      <calendar-header
        :current-date="calendarDateHeader"
        @date-navigator="navigateDate"
      ></calendar-header>

      <!-- Make this dynamic -->
      <month-calendar :current-date="currentDate"></month-calendar>
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns'
import CalendarHeader from './subcomponents/CalendarHeader.vue'
import MonthCalendar from './subcomponents/MonthCalendar.vue'

export default {
  name: 'SmartCalendar',
  components: {
    CalendarHeader,
    MonthCalendar,
  },
  props: {
    events: {
      type: Array,
      required: true,
      default() {
        return [
          {
            date: new Date(),
            title: 'Event1',
            desc: 'This is a sample description',
            time: '10:00 PM',
          },
          {
            date: new Date(),
            title: 'Event2',
            desc: 'This is a sample description',
            time: '11:00 AM',
          },
          {
            date: new Date(),
            title: 'Event3',
            desc: 'This is a sample description',
            time: '2:00 PM',
          },
        ]
      },
    },
  },
  data() {
    return {
      currentDate: new Date(),
    }
  },
  computed: {
    /**
     * @todo Make the date format dynamic
     * @returns {any}
     */
    calendarDateHeader() {
      return format(this.currentDate, 'MMMM yyyy')
    },
  },
  methods: {
    navigateDate(nav) {
      const navigatorMapper = {
        prev: this.previousDate,
        next: this.nextDate,
        today: this.toggleToday,
      }

      if (navigatorMapper) navigatorMapper[nav]()
    },

    previousDate() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1,
      )
    },
    nextDate() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1,
      )
    },
    toggleToday() {
      this.currentDate = new Date()
    },
  },
}
</script>
