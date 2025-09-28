<template>
  <header class="card-header">
    <div class="d-flex align-items-center justify-content-between">
      <div class="d-inline-flex gap-3">
        <button class="btn rounded-pill border border-dark px-4">Today</button>
        <div class="btn-group">
          <button class="btn">&lt;</button>
          <button class="btn">&gt;</button>
        </div>
        <div class="p-1 fs-4">September 28, 2025</div>
      </div>
      <select class="justify-self-end" name="calendarType" id="calendarType">
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
      </select>
    </div>
  </header>
</template>

<script>
export default {
  name: 'CalendarHeader',
}
</script>

<style scoped></style>
