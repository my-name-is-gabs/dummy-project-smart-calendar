<template>
  <div class="calendar-grid">
    <calendar-child-header :labels="weeks" option="week"></calendar-child-header>
    <div>This is week calendar</div>
  </div>
</template>

<script>
import CalendarChildHeader from '../common/CalendarChildHeader.vue'

export default {
  name: 'WeekCalendar',
  components: {
    CalendarChildHeader,
  },
  data() {
    return {
      weeks: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      option: 'month',
    }
  },
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
</style>
