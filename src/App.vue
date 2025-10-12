<template>
  <div>
    <smart-calendar :events="dummyEvents"></smart-calendar>
  </div>
</template>

<script>
/**
 *@TODO
 * 1. User should be able to select what calendar to preview (day, week, workday(Option), Month)
 * 2. User should be able to pass the event data ✅
 * 3. User should be able to dynamically change the design of the calendar
 * 4. When the user hovers in an event use tooltip
 *
 * <smart-calendar
 * :events=[]
 * :customStyle={}
 * >
 * </smart-calendar>
 */
import SmartCalendar from './components/SmartCalendar.vue'
import { events } from './seed/dummyData'

export default {
  name: 'App',
  components: {
    SmartCalendar,
  },
  data() {
    return {
      dummyEvents: events,
    }
  },
}
</script>
