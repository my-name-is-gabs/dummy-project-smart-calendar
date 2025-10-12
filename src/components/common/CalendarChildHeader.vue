<template>
  <div
    class="text-center py-2 fw-bold border-bottom border-secondary d-inline-flex flex-column"
    v-for="(label, index) in labels"
    :key="index"
  >
    {{ label }}
    <div v-show="isWeek" class="h-50">1</div>
  </div>
</template>

<script>
export default {
  name: 'CalendarChildHeader',
  props: {
    labels: {
      type: [Array],
      required: false,
    },
    option: {
      type: String,
      required: false,
    },
    days: {
      type: [Number, String],
      required: false,
    },
  },
  computed: {
    isWeek() {
      return this.option === 'week'
    },
  },
}
</script>
