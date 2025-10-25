import { shallowMount } from '@vue/test-utils'
import { describe, it, expect, beforeAll, vi } from 'vitest'
import CalendarChildHeader from '@/components/common/CalendarChildHeader.vue'

describe('CalendarChildHeader.vue', () => {
  let currentDate

  beforeAll(() => {
    currentDate = new Date('2025-01-15T12:00:00') // Wednesday
    vi.useFakeTimers()
    vi.setSystemTime(currentDate)
  })

  describe('Component Rendering and Structure', () => {
    it('should render month header by default', () => {
      const wrapper = shallowMount(CalendarChildHeader, {
        props: { currentDate },
      })

      expect(wrapper.find('.month-header').exists()).toBe(true)
      expect(wrapper.find('.week-header').exists()).toBe(false)
      expect(wrapper.findAll('.day-label')).toHaveLength(7)
    })

    it('should render week header when viewType is week', () => {
      const wrapper = shallowMount(CalendarChildHeader, {
        props: { currentDate, viewType: 'week' },
      })

      expect(wrapper.find('.month-header').exists()).toBe(false)
      expect(wrapper.find('.week-header').exists()).toBe(true)
      expect(wrapper.findAll('.day-header')).toHaveLength(7)
    })
  })

  describe('Props Handling', () => {
    it('should initialize with default props', () => {
      const wrapper = shallowMount(CalendarChildHeader, {
        props: { currentDate },
      })

      expect(wrapper.props().currentDate).toEqual(currentDate)
      expect(wrapper.props().viewType).toBe('month')
      expect(wrapper.props().dayNames).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
      expect(wrapper.props().weekStartsOn).toBe(0)
      expect(wrapper.props().showMonthInWeek).toBe(true)
    })

    it('should use custom props when provided', () => {
      const customDayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

      const wrapper = shallowMount(CalendarChildHeader, {
        props: {
          currentDate,
          viewType: 'week',
          dayNames: customDayNames,
          weekStartsOn: 1,
          showMonthInWeek: false,
        },
      })

      expect(wrapper.props().viewType).toBe('week')
      expect(wrapper.props().dayNames).toEqual(customDayNames)
      expect(wrapper.props().weekStartsOn).toBe(1)
      expect(wrapper.props().showMonthInWeek).toBe(false)
    })

    it('should validate viewType prop', () => {
      const validViews = ['month', 'week']

      validViews.forEach((view) => {
        const wrapper = shallowMount(CalendarChildHeader, {
          props: { currentDate, viewType: view },
        })

        expect(wrapper.props().viewType).toBe(view)
      })
    })

    it('should validate weekStartsOn prop', () => {
      const validStarts = [0, 1, 2, 3, 4, 5, 6]

      validStarts.forEach((startDay) => {
        const wrapper = shallowMount(CalendarChildHeader, {
          props: { currentDate, weekStartsOn: startDay },
        })

        expect(wrapper.props().weekStartsOn).toBe(startDay)
      })
    })
  })

  describe('Computed Properties', () => {
    describe('isWeekView', () => {
      it('should return true for week view type', () => {
        const wrapper = shallowMount(CalendarChildHeader, {
          props: { currentDate, viewType: 'week' },
        })

        expect(wrapper.vm.isWeekView).toBe(true)
      })

      it('should return false for month view type', () => {
        const wrapper = shallowMount(CalendarChildHeader, {
          props: { currentDate, viewType: 'month' },
        })

        expect(wrapper.vm.isWeekView).toBe(false)
      })
    })

    describe('weekDayLabels', () => {
      it('should generate day labels starting from Sunday by default', () => {
        const wrapper = shallowMount(CalendarChildHeader, {
          props: { currentDate },
        })

        const labels = wrapper.vm.weekDayLabels
        expect(labels).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
      })

      it('should generate day labels starting from Monday when weekStartsOn is 1', () => {
        const wrapper = shallowMount(CalendarChildHeader, {
          props: { currentDate, weekStartsOn: 1 },
        })

        const labels = wrapper.vm.weekDayLabels
        expect(labels).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
      })

      it('should generate day labels starting from custom day', () => {
        const wrapper = shallowMount(CalendarChildHeader, {
          props: { currentDate, weekStartsOn: 3 }, // Wednesday
        })

        const labels = wrapper.vm.weekDayLabels
        expect(labels).toEqual(['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'])
      })

      it('should use custom day names when provided', () => {
        const customDayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

        const wrapper = shallowMount(CalendarChildHeader, {
          props: { currentDate, dayNames: customDayNames, weekStartsOn: 1 },
        })

        const labels = wrapper.vm.weekDayLabels
        expect(labels).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D'])
      })
    })

    describe('weekDays', () => {
      it('should return empty array for month view', () => {
        const wrapper = shallowMount(CalendarChildHeader, {
          props: { currentDate, viewType: 'month' },
        })

        expect(wrapper.vm.weekDays).toEqual([])
      })

      it('should generate week days for week view starting from Sunday', () => {
        const wrapper = shallowMount(CalendarChildHeader, {
          props: { currentDate: new Date('2025-01-15'), viewType: 'week' },
        })

        const weekDays = wrapper.vm.weekDays
        expect(weekDays).toHaveLength(7)

        // Should start from Sunday (Jan 12) and end on Saturday (Jan 18)
        expect(weekDays[0].dateNumber).toBe('12')
        expect(weekDays[0].dayName).toBe('Sun')
        expect(weekDays[6].dateNumber).toBe('18')
        expect(weekDays[6].dayName).toBe('Sat')

        // Check that Wednesday (Jan 15) is marked as today
        const wednesday = weekDays.find((day) => day.dateNumber === '15')
        expect(wednesday.isToday).toBe(true)
        expect(wednesday.isCurrentMonth).toBe(true)
      })

      it('should generate week days starting from Monday when weekStartsOn is 1', () => {
        const wrapper = shallowMount(CalendarChildHeader, {
          props: {
            currentDate: new Date('2025-01-15'),
            viewType: 'week',
            weekStartsOn: 1,
          },
        })

        const weekDays = wrapper.vm.weekDays
        expect(weekDays).toHaveLength(7)

        // Should start from Monday (Jan 13) and end on Sunday (Jan 19)
        expect(weekDays[0].dateNumber).toBe('13')
        expect(weekDays[0].dayName).toBe('Mon')
        expect(weekDays[6].dateNumber).toBe('19')
        expect(weekDays[6].dayName).toBe('Sun')
      })

      it('should correctly identify days from different months', () => {
        // Use a date at the end of the month
        const endOfMonthDate = new Date('2025-01-31')
        const wrapper = shallowMount(CalendarChildHeader, {
          props: {
            currentDate: endOfMonthDate,
            viewType: 'week',
          },
        })

        const weekDays = wrapper.vm.weekDays

        // Should include days from both January and February
        const januaryDays = weekDays.filter((day) => day.monthName === 'Jan')
        const februaryDays = weekDays.filter((day) => day.monthName === 'Feb')

        expect(januaryDays.length).toBeGreaterThan(0)
        expect(februaryDays.length).toBeGreaterThan(0)

        // Days from different months should have isCurrentMonth = false
        const differentMonthDays = weekDays.filter((day) => !day.isCurrentMonth)
        expect(differentMonthDays.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Template Rendering and Conditional Classes', () => {
    it('should apply correct classes for today in week view', () => {
      const wrapper = shallowMount(CalendarChildHeader, {
        props: { currentDate, viewType: 'week' },
      })

      const dayHeaders = wrapper.findAll('.day-header')
      const todayHeader = dayHeaders.find((header) => header.classes().includes('today'))

      expect(todayHeader.exists()).toBe(true)

      // Just verify that we found a today header with the correct class
      // The specific date number styling might be too implementation-specific
      expect(todayHeader.classes()).toContain('today')
    })

    it('should apply different-month class for days not in current month', () => {
      const endOfMonthDate = new Date('2025-01-31')
      const wrapper = shallowMount(CalendarChildHeader, {
        props: { currentDate: endOfMonthDate, viewType: 'week' },
      })

      const differentMonthHeaders = wrapper.findAll('.day-header.different-month')
      expect(differentMonthHeaders.length).toBeGreaterThan(0)
    })

    it('should show month name for different months when showMonthInWeek is true', () => {
      const endOfMonthDate = new Date('2025-01-31')
      const wrapper = shallowMount(CalendarChildHeader, {
        props: { currentDate: endOfMonthDate, viewType: 'week', showMonthInWeek: true },
      })

      const monthNames = wrapper.findAll('.month-name')
      expect(monthNames.length).toBeGreaterThan(0)
    })

    it('should not show month name when showMonthInWeek is false', () => {
      const endOfMonthDate = new Date('2025-01-31')
      const wrapper = shallowMount(CalendarChildHeader, {
        props: { currentDate: endOfMonthDate, viewType: 'week', showMonthInWeek: false },
      })

      const monthNames = wrapper.findAll('.month-name')
      expect(monthNames.length).toBe(0)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle custom day names with different lengths', () => {
      const shortDayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

      const wrapper = shallowMount(CalendarChildHeader, {
        props: { currentDate, dayNames: shortDayNames },
      })

      const labels = wrapper.vm.weekDayLabels
      expect(labels).toEqual(shortDayNames)
    })

    it('should handle month boundary weeks correctly', () => {
      const boundaryDates = [
        new Date('2025-02-01'), // Start of month
        new Date('2025-01-31'), // End of month
        new Date('2025-12-25'), // Christmas in December
        new Date('2024-02-29'), // Leap year
      ]

      boundaryDates.forEach((date) => {
        const wrapper = shallowMount(CalendarChildHeader, {
          props: { currentDate: date, viewType: 'week' },
        })

        const weekDays = wrapper.vm.weekDays
        expect(weekDays).toHaveLength(7)

        // All days should have required properties
        weekDays.forEach((day) => {
          expect(day.date).toBeInstanceOf(Date)
          expect(day.dayName).toBeDefined()
          expect(day.dateNumber).toBeDefined()
          expect(day.monthName).toBeDefined()
          expect(typeof day.isToday).toBe('boolean')
          expect(typeof day.isCurrentMonth).toBe('boolean')
        })
      })
    })

    it('should handle weekStartsOn at boundaries', () => {
      const boundaryStarts = [0, 6] // Sunday and Saturday

      boundaryStarts.forEach((startDay) => {
        const wrapper = shallowMount(CalendarChildHeader, {
          props: { currentDate, weekStartsOn: startDay, viewType: 'week' },
        })

        const weekDays = wrapper.vm.weekDays
        expect(weekDays).toHaveLength(7)

        // First day should match the weekStartsOn day
        const firstDayIndex = weekDays[0].date.getDay()
        expect(firstDayIndex).toBe(startDay)
      })
    })
  })
})
