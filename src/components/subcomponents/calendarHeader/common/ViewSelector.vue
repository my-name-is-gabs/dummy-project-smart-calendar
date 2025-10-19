<!-- subcomponents/ViewSelector.vue -->
<template>
  <div class="view-selector">
    <select class="form-select" :value="selectedView" @change="handleChange">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'ViewSelector',
  props: {
    options: {
      type: Array,
      required: true,
    },
    selectedView: {
      type: String,
      required: true,
    },
  },
  emits: ['view-change'],
  methods: {
    handleChange(event) {
      this.$emit('view-change', event.target.value)
    },
  },
}
</script>
