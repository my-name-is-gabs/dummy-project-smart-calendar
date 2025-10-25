import { shallowMount } from '@vue/test-utils'
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { isSameDay } from 'date-fns'
import WeekCalendar from '@/components/subcomponents/WeekCalendar.vue'

describe('WeekCalendar.vue', () => {
  let currentDate

  beforeAll(() => {
    currentDate = new Date('2025-01-15T12:00:00') // Wednesday
    vi.useFakeTimers()
    vi.setSystemTime(currentDate)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Computed Properties', () => {
    describe('weekDays', () => {
      it('should generate 7 days from Sunday to Saturday', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate },
        })

        const weekDays = wrapper.vm.weekDays

        expect(weekDays).toHaveLength(7)
        expect(weekDays[0].dayName).toBe('Sun')
        expect(weekDays[6].dayName).toBe('Sat')
        expect(weekDays[3].isToday).toBe(true) // Wednesday is today
      })

      it('should handle different week starting days', () => {
        const mondayDate = new Date('2025-01-13') // Monday
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate: mondayDate },
        })

        const weekDays = wrapper.vm.weekDays
        expect(weekDays[0].dayName).toBe('Sun') // Always starts on Sunday per component
        expect(weekDays[1].dayName).toBe('Mon')
      })

      it('should handle month boundaries correctly', () => {
        const monthBoundaryDate = new Date('2025-01-31') // End of January
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate: monthBoundaryDate },
        })

        const weekDays = wrapper.vm.weekDays
        // Should include days from both January and February
        const hasJanuary = weekDays.some((day) => day.month === 'Jan')
        const hasFebruary = weekDays.some((day) => day.month === 'Feb')
        expect(hasJanuary).toBe(true)
        expect(hasFebruary).toBe(true)
      })
    })
  })

  describe('Formatting Methods', () => {
    describe('formatHour', () => {
      it('should format hours in 12-hour format correctly', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate, hourFormat12: true },
        })

        // Edge cases
        expect(wrapper.vm.formatHour(0)).toBe('12 AM') // Midnight
        expect(wrapper.vm.formatHour(12)).toBe('12 PM') // Noon
        expect(wrapper.vm.formatHour(6)).toBe('6 AM') // Morning
        expect(wrapper.vm.formatHour(18)).toBe('6 PM') // Evening
      })

      it('should format hours in 24-hour format correctly', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate, hourFormat12: false },
        })

        expect(wrapper.vm.formatHour(0)).toBe('00:00') // Midnight
        expect(wrapper.vm.formatHour(9)).toBe('09:00') // Single digit
        expect(wrapper.vm.formatHour(12)).toBe('12:00') // Noon
        expect(wrapper.vm.formatHour(23)).toBe('23:00') // Evening
      })

      it('should handle all 24 hours without errors', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate, hourFormat12: true },
        })

        // Test all hours from 0 to 23
        for (let hour = 0; hour < 24; hour++) {
          expect(() => wrapper.vm.formatHour(hour)).not.toThrow()
          expect(wrapper.vm.formatHour(hour)).toBeDefined()
        }
      })
    })

    describe('formatTime', () => {
      it('should format time in 12-hour format', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate, hourFormat12: true },
        })

        expect(wrapper.vm.formatTime(new Date('2025-01-15T00:30:00'))).toContain('12:30 AM')
        expect(wrapper.vm.formatTime(new Date('2025-01-15T14:45:00'))).toContain('2:45 PM')
      })

      it('should format time in 24-hour format', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate, hourFormat12: false },
        })

        expect(wrapper.vm.formatTime(new Date('2025-01-15T00:30:00'))).toBe('00:30')
        expect(wrapper.vm.formatTime(new Date('2025-01-15T14:45:00'))).toBe('14:45')
      })

      it('should handle invalid dates gracefully', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate },
        })

        const invalidDate = new Date('invalid')
        expect(wrapper.vm.formatTime(invalidDate)).toBe('Invalid time')
      })
    })
  })

  describe('Event Handling Methods', () => {
    describe('handleSlotClick', () => {
      it('should emit slot-click with correct datetime', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate },
        })

        const testDate = new Date('2025-01-15')
        const testHour = 14

        wrapper.vm.handleSlotClick(testDate, testHour)

        expect(wrapper.emitted('slot-click')).toHaveLength(1)
        const emittedDate = wrapper.emitted('slot-click')[0][0]
        expect(emittedDate.getHours()).toBe(14)
        expect(emittedDate.getMinutes()).toBe(0)
        expect(isSameDay(emittedDate, testDate)).toBe(true)
      })

      it('should handle edge hour values', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate },
        })

        const testDate = new Date('2025-01-15')

        // Test minimum hour
        wrapper.vm.handleSlotClick(testDate, 0)
        expect(wrapper.emitted('slot-click')[0][0].getHours()).toBe(0)

        // Test maximum hour
        wrapper.vm.handleSlotClick(testDate, 23)
        expect(wrapper.emitted('slot-click')[1][0].getHours()).toBe(23)
      })
    })

    describe('getEventsForSlot', () => {
      it('should filter events by date and hour', () => {
        const events = [
          {
            id: 1,
            title: 'Morning Meeting',
            datetime: new Date('2025-01-15T09:00:00').getTime(),
            type: 'primary',
          },
          {
            id: 2,
            title: 'Lunch',
            datetime: new Date('2025-01-15T12:00:00').getTime(),
            type: 'success',
          },
          {
            id: 3,
            title: 'Other Day',
            datetime: new Date('2025-01-16T09:00:00').getTime(),
            type: 'warning',
          },
        ]

        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate, events },
        })

        const sameDaySameHour = wrapper.vm.getEventsForSlot(new Date('2025-01-15'), 9)
        expect(sameDaySameHour).toHaveLength(1)
        expect(sameDaySameHour[0].title).toBe('Morning Meeting')

        const sameDayDifferentHour = wrapper.vm.getEventsForSlot(new Date('2025-01-15'), 10)
        expect(sameDayDifferentHour).toHaveLength(0)

        const differentDaySameHour = wrapper.vm.getEventsForSlot(new Date('2025-01-16'), 9)
        expect(differentDaySameHour).toHaveLength(1)
      })

      it('should handle empty events array', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate, events: [] },
        })

        const result = wrapper.vm.getEventsForSlot(new Date('2025-01-15'), 9)
        expect(result).toEqual([])
      })

      it('should handle events with invalid datetime', () => {
        const events = [
          {
            id: 1,
            title: 'Invalid Date',
            datetime: 'invalid',
            type: 'primary',
          },
        ]

        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate, events },
        })

        // Should not throw, but return empty array due to invalid date
        const result = wrapper.vm.getEventsForSlot(new Date('2025-01-15'), 9)
        expect(result).toEqual([])
      })

      it('should handle null/undefined parameters', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate },
        })

        // Should handle null date
        expect(() => wrapper.vm.getEventsForSlot(null, 9)).not.toThrow()

        // Should handle undefined hour
        expect(() => wrapper.vm.getEventsForSlot(new Date('2025-01-15'), undefined)).not.toThrow()
      })
    })
  })

  describe('Time Management Methods', () => {
    describe('updateCurrentTime', () => {
      it('should update currentTime and calculate position correctly', () => {
        const testTime = new Date('2025-01-15T14:30:00') // 2:30 PM
        vi.setSystemTime(testTime)

        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate },
        })

        wrapper.vm.updateCurrentTime()

        expect(wrapper.vm.currentTime).toEqual(testTime)
        // Position calculation: (14 + 30/60) / 24 * 100 = 60.416...
        expect(wrapper.vm.currentTimeIndicator.position).toBeCloseTo(60.416, 2)
      })

      it('should handle start of day position', () => {
        const midnight = new Date('2025-01-15T00:00:00')
        vi.setSystemTime(midnight)

        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate },
        })

        wrapper.vm.updateCurrentTime()
        expect(wrapper.vm.currentTimeIndicator.position).toBe(0)
      })

      it('should handle end of day position', () => {
        const endOfDay = new Date('2025-01-15T23:59:59')
        vi.setSystemTime(endOfDay)

        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate },
        })

        wrapper.vm.updateCurrentTime()
        expect(wrapper.vm.currentTimeIndicator.position).toBeCloseTo(99.93, 1)
      })
    })

    describe('initializeCurrentTimeUpdater', () => {
      it('should set up interval and initial time', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate },
        })

        // Manually call since mounted hook might have already called it
        wrapper.vm.initializeCurrentTimeUpdater()

        expect(wrapper.vm.currentTime).toBeDefined()
        expect(wrapper.vm.timeInterval).toBeDefined()
      })
    })

    describe('clearTimeInterval', () => {
      it('should clear existing interval', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate },
        })

        // Set up an interval first
        wrapper.vm.timeInterval = setInterval(() => {}, 1000)
        wrapper.vm.clearTimeInterval()

        expect(wrapper.vm.timeInterval).toBeNull()
      })

      it('should handle when no interval exists', () => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate },
        })

        wrapper.vm.timeInterval = null
        expect(() => wrapper.vm.clearTimeInterval()).not.toThrow()
        expect(wrapper.vm.timeInterval).toBeNull()
      })
    })
  })

  describe('Lifecycle Methods', () => {
    it('should initialize time updater on mount', () => {
      const initializeSpy = vi.spyOn(WeekCalendar.methods, 'initializeCurrentTimeUpdater')

      shallowMount(WeekCalendar, {
        props: { currentDate },
      })

      expect(initializeSpy).toHaveBeenCalled()
    })

    it('should clear interval on unmount', () => {
      const clearSpy = vi.spyOn(WeekCalendar.methods, 'clearTimeInterval')

      const wrapper = shallowMount(WeekCalendar, {
        props: { currentDate },
      })

      wrapper.unmount()
      expect(clearSpy).toHaveBeenCalled()
    })
  })

  describe('Edge Cases and Error Boundaries', () => {
    it('should handle various currentDate values', () => {
      // Test with extreme but valid dates
      const testCases = [
        new Date(0), // Unix epoch (1970)
        new Date('2025-01-15'), // Normal date
        new Date(2030, 11, 31), // Future date
      ]

      testCases.forEach((testDate) => {
        const wrapper = shallowMount(WeekCalendar, {
          props: { currentDate: testDate },
        })

        // Should always generate 7 days
        expect(wrapper.vm.weekDays).toHaveLength(7)
        expect(wrapper.find('.week-calendar').exists()).toBe(true)
      })
    })

    it('should handle events with missing properties', () => {
      const incompleteEvents = [
        { id: 1, datetime: new Date('2025-01-15T10:00:00').getTime() }, // missing title
        { title: 'No ID', datetime: new Date('2025-01-15T11:00:00').getTime() }, // missing id
        { id: 3, title: 'No datetime' }, // missing datetime
      ]

      const wrapper = shallowMount(WeekCalendar, {
        props: { currentDate, events: incompleteEvents },
      })

      // Should not throw when processing events
      expect(() => wrapper.vm.getEventsForSlot(new Date('2025-01-15'), 10)).not.toThrow()
    })

    it('should handle rapid prop changes', async () => {
      const wrapper = shallowMount(WeekCalendar, {
        props: { currentDate, events: [], hourFormat12: true },
      })

      const newDate = new Date('2025-01-22')
      const newEvents = [
        { id: 1, title: 'New', datetime: new Date('2025-01-22T10:00:00').getTime() },
      ]

      await wrapper.setProps({ currentDate: newDate, events: newEvents, hourFormat12: false })

      // All computed and methods should work with new props
      expect(wrapper.vm.weekDays).toHaveLength(7)
      expect(wrapper.vm.formatHour(15)).toBe('15:00') // 24-hour format
      expect(wrapper.vm.getEventsForSlot(newDate, 10)).toHaveLength(1)
    })
  })
})
