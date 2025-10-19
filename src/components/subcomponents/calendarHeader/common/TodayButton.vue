<template>
  <button class="btn btn-outline-primary rounded-pill px-4" @click="$emit('today-click')">
    <i class="bi bi-calendar-check me-2"></i>
    {{ label }}
  </button>
</template>

<script>
export default {
  name: 'TodayButton',
  props: {
    label: {
      type: String,
      required: true,
    },
  },
  emits: ['today-click'],
}
</script>
