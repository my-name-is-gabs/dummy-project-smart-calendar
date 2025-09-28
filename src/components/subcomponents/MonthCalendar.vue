<template>
  <div class="calendar">
    <div class="day-cell border border-secondary position-relative">1</div>
    <div class="day-cell border border-primary">1</div>
  </div>
</template>

<script>
export default {
  name: 'MonthCalendar',
}
</script>

<style scoped>
.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.day-cell {
  min-height: 120px;
}
</style>
