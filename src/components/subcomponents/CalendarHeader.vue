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
      <div class="justify-self-end">
        <select
          class="form-select"
          name="calendarType"
          id="calendarType"
          @change="handleSelectOption"
        >
          <option v-for="(option, key) in calendarOptions" :key="key" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
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
      calendarOptions: ['day', 'week', 'month'],
    }
  },
  emits: ['date-navigator', 'calendar-option'],
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
    handleSelectOption(event) {
      this.$emit('calendar-option', event.target.value)
    },
  },
}
</script>

<style scoped></style>
