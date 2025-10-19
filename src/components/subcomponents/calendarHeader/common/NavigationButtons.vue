<template>
  <div class="btn-group">
    <button
      class="btn btn-outline-secondary"
      @click="$emit('navigate-left')"
      :title="`Previous ${currentView}`"
    >
      <i class="bi bi-chevron-left"></i>
    </button>
    <button
      class="btn btn-outline-secondary"
      @click="$emit('navigate-right')"
      :title="`Next ${currentView}`"
    >
      <i class="bi bi-chevron-right"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'NavigationButtons',
  props: {
    currentView: {
      type: String,
      required: true,
    },
  },
  emits: ['navigate-left', 'navigate-right'],
}
</script>
