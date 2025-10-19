import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import WeekCalendar from '@/components/subcomponents/WeekCalendar.vue'

// Mock date-fns for time-dependent tests
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    isToday: vi.fn(),
    getHours: vi.fn(),
    getMinutes: vi.fn(),
  }
})

describe('WeekCalendar.vue - Essential Edge Cases', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Time Formatting Edge Cases', () => {
    it('should format boundary hours correctly in 12-hour format', () => {
      wrapper = mount(WeekCalendar, {
        props: { hourFormat12: true },
      })

      expect(wrapper.vm.formatHour(0)).toBe('12 AM')
      expect(wrapper.vm.formatHour(12)).toBe('12 PM')
      expect(wrapper.vm.formatHour(23)).toBe('11 PM')
    })

    it('should format boundary hours correctly in 24-hour format', () => {
      wrapper = mount(WeekCalendar, {
        props: { hourFormat12: false },
      })

      expect(wrapper.vm.formatHour(0)).toBe('00:00')
      expect(wrapper.vm.formatHour(12)).toBe('12:00')
      expect(wrapper.vm.formatHour(23)).toBe('23:00')
    })
  })

  describe('Event Filtering Edge Cases', () => {
    it('should handle empty events array', () => {
      wrapper = mount(WeekCalendar, {
        props: { events: [] },
      })

      const events = wrapper.vm.getEventsForSlot(new Date(), 10)
      expect(events).toHaveLength(0)
    })

    it('should filter events by exact hour match', () => {
      const currentDate = new Date(2025, 0, 13) // Monday, Jan 13, 2025
      const events = [
        {
          id: 1,
          title: '9 AM Event',
          startTime: new Date(2025, 0, 13, 9, 0),
        },
        {
          id: 2,
          title: '9:30 AM Event',
          startTime: new Date(2025, 0, 13, 9, 30),
        },
      ]

      wrapper = mount(WeekCalendar, {
        props: {
          currentDate: currentDate,
          events,
        },
      })

      const hour9Events = wrapper.vm.getEventsForSlot(currentDate, 9)
      expect(hour9Events).toHaveLength(2)
    })

    it('should not show events from different days', () => {
      const currentDate = new Date(2025, 0, 13) // Monday
      const events = [
        {
          id: 1,
          title: 'Monday Event',
          startTime: new Date(2025, 0, 13, 10, 0),
        },
        {
          id: 2,
          title: 'Tuesday Event',
          startTime: new Date(2025, 0, 14, 10, 0),
        },
      ]

      wrapper = mount(WeekCalendar, {
        props: {
          currentDate: currentDate,
          events,
        },
      })

      const mondayEvents = wrapper.vm.getEventsForSlot(new Date(2025, 0, 13), 10)
      expect(mondayEvents).toHaveLength(1)
      expect(mondayEvents[0].title).toBe('Monday Event')
    })
  })

  describe('Current Time Indicator Edge Cases', () => {
    it('should calculate position correctly at midnight', () => {
      const { getHours, getMinutes, isToday } = require('date-fns')
      getHours.mockReturnValue(0)
      getMinutes.mockReturnValue(0)
      isToday.mockReturnValue(true)

      wrapper = mount(WeekCalendar)
      wrapper.vm.updateCurrentTime()

      expect(wrapper.vm.currentTimeIndicator.position).toBe(0)
    })

    it('should calculate position correctly at noon', () => {
      const { getHours, getMinutes, isToday } = require('date-fns')
      getHours.mockReturnValue(12)
      getMinutes.mockReturnValue(0)
      isToday.mockReturnValue(true)

      wrapper = mount(WeekCalendar)
      wrapper.vm.updateCurrentTime()

      expect(wrapper.vm.currentTimeIndicator.position).toBe(50)
    })

    it('should not show indicator on non-today days', () => {
      const { isToday } = require('date-fns')
      isToday.mockReturnValue(false)

      wrapper = mount(WeekCalendar)

      const timeIndicators = wrapper.findAll('.current-time-indicator')
      expect(timeIndicators).toHaveLength(0)
    })
  })

  describe('Week Calculation Edge Cases', () => {
    it('should always generate 7 days', () => {
      const testDates = [
        new Date(2025, 0, 1), // New Year
        new Date(2025, 11, 31), // Year end
      ]

      testDates.forEach((date) => {
        wrapper = mount(WeekCalendar, {
          props: { currentDate: date },
        })
        expect(wrapper.vm.weekDays).toHaveLength(7)
      })
    })

    it('should start week on Sunday and end on Saturday', () => {
      wrapper = mount(WeekCalendar, {
        props: { currentDate: new Date(2025, 0, 13) }, // A Monday
      })

      const weekDays = wrapper.vm.weekDays
      expect(weekDays[0].dayName).toBe('Sun')
      expect(weekDays[6].dayName).toBe('Sat')
    })
  })

  describe('Slot Click Edge Cases', () => {
    it('should emit correct datetime for slot clicks', async () => {
      wrapper = mount(WeekCalendar)

      const testDate = new Date(2025, 0, 13)
      const testHour = 14

      wrapper.vm.handleSlotClick(testDate, testHour)
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('slot-click')).toHaveLength(1)
      const emittedDate = wrapper.emitted('slot-click')[0][0]
      expect(emittedDate.getHours()).toBe(14)
      expect(emittedDate.getMinutes()).toBe(0)
    })
  })

  describe('Component Lifecycle Edge Cases', () => {
    it('should initialize with default props', () => {
      expect(() => {
        wrapper = mount(WeekCalendar)
      }).not.toThrow()

      expect(wrapper.vm.weekDays).toHaveLength(7)
      expect(wrapper.vm.hours).toHaveLength(24)
    })

    it('should clean up intervals on unmount', () => {
      wrapper = mount(WeekCalendar)

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
      wrapper.unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
      clearIntervalSpy.mockRestore()
    })
  })
})
