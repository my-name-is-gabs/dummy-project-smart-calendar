<template>
  <div class="current-date-display">
    <h4 class="mb-0 text-dark fw-bold">{{ formattedDate }}</h4>
  </div>
</template>

<script>
export default {
  name: 'DateDisplay',
  props: {
    formattedDate: {
      type: String,
      required: true,
    },
  },
}
</script>
