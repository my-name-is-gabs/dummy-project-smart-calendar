<template>
  <div class="container-fluid">
    <div class="card">
      <calendar-header></calendar-header>
      <month-calendar></month-calendar>
    </div>
  </div>
</template>

<script>
import CalendarHeader from './subcomponents/CalendarHeader.vue'
import MonthCalendar from './subcomponents/MonthCalendar.vue'

export default {
  name: 'SmartCalendar',
  components: {
    CalendarHeader,
    MonthCalendar,
  },
}
</script>
