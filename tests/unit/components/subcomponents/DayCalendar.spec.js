import { shallowMount } from '@vue/test-utils'
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import { isSameDay } from 'date-fns'
import DayCalendar from '@/components/subcomponents/DayCalendar.vue'

describe('DayCalendar.vue', () => {
  let currentDate

  beforeAll(() => {
    currentDate = new Date('2025-01-15T12:00:00')
    vi.useFakeTimers()
    vi.setSystemTime(currentDate)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Component Rendering and Structure', () => {
    it('should render the day calendar with correct structure', () => {
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate },
      })

      expect(wrapper.find('.day-calendar').exists()).toBe(true)
      expect(wrapper.find('.calendar-body').exists()).toBe(true)
      expect(wrapper.findAll('.time-label')).toHaveLength(24)
      expect(wrapper.findAll('.hour-slot')).toHaveLength(24)
    })

    it('should render time labels for all 24 hours', () => {
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate },
      })

      const timeLabels = wrapper.findAll('.time-label')
      expect(timeLabels).toHaveLength(24)

      // Check first and last hour labels
      expect(timeLabels[0].text()).toContain('12 AM')
      expect(timeLabels[23].text()).toContain('11 PM')
    })
  })

  describe('Props Handling', () => {
    it('should initialize with default props', () => {
      const wrapper = shallowMount(DayCalendar)

      expect(wrapper.props().currentDate).toBeInstanceOf(Date)
      expect(wrapper.props().events).toEqual([])
      expect(wrapper.props().hourFormat12).toBe(true)
    })

    it('should use custom props when provided', () => {
      const customEvents = [{ id: 1, title: 'Test Event', datetime: new Date(), type: 'primary' }]

      const wrapper = shallowMount(DayCalendar, {
        props: {
          currentDate: new Date('2025-01-20'),
          events: customEvents,
          hourFormat12: false,
        },
      })

      expect(wrapper.props().currentDate).toEqual(new Date('2025-01-20'))
      expect(wrapper.props().events).toEqual(customEvents)
      expect(wrapper.props().hourFormat12).toBe(false)
    })
  })

  describe('Formatting Methods', () => {
    it('should format hours in 12-hour format correctly', () => {
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate, hourFormat12: true },
      })

      expect(wrapper.vm.formatHour(0)).toBe('12 AM')
      expect(wrapper.vm.formatHour(12)).toBe('12 PM')
      expect(wrapper.vm.formatHour(9)).toBe('9 AM')
      expect(wrapper.vm.formatHour(18)).toBe('6 PM')
    })

    it('should format hours in 24-hour format correctly', () => {
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate, hourFormat12: false },
      })

      expect(wrapper.vm.formatHour(0)).toBe('00:00')
      expect(wrapper.vm.formatHour(9)).toBe('09:00')
      expect(wrapper.vm.formatHour(12)).toBe('12:00')
      expect(wrapper.vm.formatHour(23)).toBe('23:00')
    })

    it('should format time based on hourFormat12 prop', () => {
      // Test with 12-hour format
      const wrapper12Hour = shallowMount(DayCalendar, {
        props: { currentDate, hourFormat12: true },
      })
      expect(wrapper12Hour.vm.formatTime(new Date('2025-01-15T14:30:00'))).toContain('2:30 PM')

      // Test with 24-hour format using a separate instance
      const wrapper24Hour = shallowMount(DayCalendar, {
        props: { currentDate, hourFormat12: false },
      })
      expect(wrapper24Hour.vm.formatTime(new Date('2025-01-15T14:30:00'))).toBe('14:30')
    })

    it('should check if date is today correctly', () => {
      // Set a specific time for today
      const today = new Date('2025-01-15T12:00:00')
      vi.setSystemTime(today)

      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate: today },
      })

      expect(wrapper.vm.isToday(today)).toBe(true)
      expect(wrapper.vm.isToday(new Date('2025-01-16'))).toBe(false)
      expect(wrapper.vm.isToday(new Date('2025-01-14'))).toBe(false)
    })

    it('should format date header correctly', () => {
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate },
      })

      const testDate = new Date('2025-01-15')
      const formatted = wrapper.vm.formatDateHeader(testDate)

      expect(formatted).toBe('Wednesday, January 15, 2025')
    })

    it('should handle different dates in formatDateHeader', () => {
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate },
      })

      const testCases = [
        { date: new Date('2025-12-25'), expected: 'Thursday, December 25, 2025' },
        { date: new Date('2024-02-29'), expected: 'Thursday, February 29, 2024' }, // Leap year
        { date: new Date('2023-07-04'), expected: 'Tuesday, July 4, 2023' },
      ]

      testCases.forEach(({ date, expected }) => {
        expect(wrapper.vm.formatDateHeader(date)).toBe(expected)
      })
    })
  })

  describe('Event Handling Methods', () => {
    it('should emit slot-click with correct datetime', async () => {
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate },
      })

      await wrapper.vm.handleSlotClick(14) // 2 PM

      expect(wrapper.emitted('slot-click')).toHaveLength(1)
      const emittedDate = wrapper.emitted('slot-click')[0][0]
      expect(emittedDate.getHours()).toBe(14)
      expect(emittedDate.getMinutes()).toBe(0)
      expect(isSameDay(emittedDate, currentDate)).toBe(true)
    })

    it('should filter events for specific hour', () => {
      const events = [
        { id: 1, title: 'Morning Event', datetime: new Date('2025-01-15T09:00:00') },
        { id: 2, title: 'Afternoon Event', datetime: new Date('2025-01-15T14:00:00') },
        { id: 3, title: 'Next Day Event', datetime: new Date('2025-01-16T09:00:00') },
      ]

      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate, events },
      })

      const morningEvents = wrapper.vm.getEventsForHour(9)
      expect(morningEvents).toHaveLength(1)
      expect(morningEvents[0].title).toBe('Morning Event')

      const afternoonEvents = wrapper.vm.getEventsForHour(14)
      expect(afternoonEvents).toHaveLength(1)
      expect(afternoonEvents[0].title).toBe('Afternoon Event')

      const nextDayEvents = wrapper.vm.getEventsForHour(9)
      expect(nextDayEvents).not.toContainEqual(expect.objectContaining({ title: 'Next Day Event' }))
    })

    it('should return empty array for hours with no events', () => {
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate, events: [] },
      })

      expect(wrapper.vm.getEventsForHour(10)).toEqual([])
    })
  })

  describe('Time Management Methods', () => {
    it('should update current time and calculate position for today', () => {
      const testTime = new Date('2025-01-15T14:30:00')
      vi.setSystemTime(testTime)

      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate },
      })

      wrapper.vm.updateCurrentTime()

      expect(wrapper.vm.currentTime).toEqual(testTime)
      expect(wrapper.vm.currentTimeIndicator.position).toBeCloseTo(60.416, 2)
    })

    it('should set position to null when currentDate is not today', () => {
      const notToday = new Date('2025-01-16T14:30:00')
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate: notToday },
      })

      wrapper.vm.updateCurrentTime()

      expect(wrapper.vm.currentTimeIndicator.position).toBeNull()
    })

    it('should initialize time updater on mount', () => {
      const initializeSpy = vi.spyOn(DayCalendar.methods, 'initializeCurrentTimeUpdater')

      shallowMount(DayCalendar, {
        props: { currentDate },
      })

      expect(initializeSpy).toHaveBeenCalled()
    })

    it('should clear interval on unmount', () => {
      const clearSpy = vi.spyOn(DayCalendar.methods, 'clearTimeInterval')

      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate },
      })

      wrapper.unmount()
      expect(clearSpy).toHaveBeenCalled()
    })
  })

  describe('Current Time Indicator', () => {
    it('should show current time indicator only for today', () => {
      const todayDate = new Date('2025-01-15T14:30:00')
      vi.setSystemTime(todayDate)

      const wrapperToday = shallowMount(DayCalendar, {
        props: { currentDate: todayDate },
      })

      const wrapperNotToday = shallowMount(DayCalendar, {
        props: { currentDate: new Date('2025-01-16') },
      })

      expect(wrapperToday.vm.currentTimeIndicator.position).not.toBeNull()
      expect(wrapperNotToday.vm.currentTimeIndicator.position).toBeNull()
    })

    it('should calculate correct positions throughout the day', () => {
      // Test start of day
      vi.setSystemTime(new Date('2025-01-15T00:00:00'))
      const wrapperStart = shallowMount(DayCalendar, { props: { currentDate } })
      expect(wrapperStart.vm.currentTimeIndicator.position).toBe(0)

      // Test middle of day
      vi.setSystemTime(new Date('2025-01-15T12:00:00'))
      const wrapperMiddle = shallowMount(DayCalendar, { props: { currentDate } })
      expect(wrapperMiddle.vm.currentTimeIndicator.position).toBe(50)

      // Test end of day
      vi.setSystemTime(new Date('2025-01-15T23:59:00'))
      const wrapperEnd = shallowMount(DayCalendar, { props: { currentDate } })
      expect(wrapperEnd.vm.currentTimeIndicator.position).toBeCloseTo(99.93, 1)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty events array', () => {
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate, events: [] },
      })

      for (let hour = 0; hour < 24; hour++) {
        expect(wrapper.vm.getEventsForHour(hour)).toEqual([])
      }
    })

    it('should handle events with invalid datetime gracefully', () => {
      const events = [
        { id: 1, title: 'Invalid Date', datetime: 'invalid' },
        { id: 2, title: 'Valid Event', datetime: new Date('2025-01-15T10:00:00') },
      ]

      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate, events },
      })

      // Should not throw when processing events
      expect(() => wrapper.vm.getEventsForHour(10)).not.toThrow()
    })

    it('should handle rapid prop changes', async () => {
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate, events: [], hourFormat12: true },
      })

      const newDate = new Date('2025-01-20')
      const newEvents = [{ id: 1, title: 'New Event', datetime: new Date('2025-01-20T10:00:00') }]

      await wrapper.setProps({ currentDate: newDate, events: newEvents, hourFormat12: false })

      expect(wrapper.vm.formatHour(15)).toBe('15:00') // 24-hour format
      expect(wrapper.vm.getEventsForHour(10)).toHaveLength(1)
    })

    it('should handle all 24 hours without errors', () => {
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate },
      })

      for (let hour = 0; hour < 24; hour++) {
        expect(() => wrapper.vm.formatHour(hour)).not.toThrow()
        expect(() => wrapper.vm.getEventsForHour(hour)).not.toThrow()
        expect(() => wrapper.vm.handleSlotClick(hour)).not.toThrow()
      }
    })
  })

  describe('Watchers', () => {
    it('should update current time when currentDate prop changes', async () => {
      const wrapper = shallowMount(DayCalendar, {
        props: { currentDate },
      })

      const updateSpy = vi.spyOn(wrapper.vm, 'updateCurrentTime')

      await wrapper.setProps({ currentDate: new Date('2025-01-16') })

      expect(updateSpy).toHaveBeenCalled()
    })
  })
})
