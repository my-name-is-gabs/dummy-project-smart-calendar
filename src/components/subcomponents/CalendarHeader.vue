<template>
  <header class="card-header">
    <div class="d-flex align-items-center justify-content-between">
      <div class="d-inline-flex gap-3">
        <button class="btn rounded-pill border border-dark px-4" @click="emitToday">
          {{ labels.todayButton }}
        </button>
        <div class="btn-group">
          <button class="btn" @click="emitNavigatorLeft">{{ labels.toggle.left }}</button>
          <button class="btn" @click="emitNavigatorRight">{{ labels.toggle.right }}</button>
        </div>
        <div class="p-1 fs-4">{{ currentDate }}</div>
      </div>

      <!-- Make this dynamic -->
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
  props: {
    currentDate: {
      type: String,
      required: true,
      default() {
        return new Date().toLocaleDateString()
      },
    },
  },
  data() {
    return {
      labels: {
        todayButton: 'Today',
        toggle: {
          left: '<',
          right: '>',
        },
      },
    }
  },
  methods: {
    emitNavigatorLeft() {
      this.$emit('date-navigator', 'prev')
    },
    emitNavigatorRight() {
      this.$emit('date-navigator', 'next')
    },
    emitToday() {
      this.$emit('date-navigator', 'today')
    },
  },
}
</script>

<style scoped></style>
