<template>
  <div>
    <h1 class="text-danger">This is the APP</h1>
    <smart-calendar></smart-calendar>
  </div>
</template>

<script>
import SmartCalendar from './components/SmartCalendar.vue'

export default {
  name: 'App',
  components: {
    SmartCalendar,
  },
}
</script>
