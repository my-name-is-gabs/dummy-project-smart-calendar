import { shallowMount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SmartCalendar from '@/components/SmartCalendar.vue'
import CalendarHeader from '@/components/subcomponents/calendarHeader/CalendarHeader.vue'
import MonthCalendar from '@/components/subcomponents/MonthCalendar.vue'
import WeekCalendar from '@/components/subcomponents/WeekCalendar.vue'
import DayCalendar from '@/components/subcomponents/DayCalendar.vue'
import EventFilterService from '@/services/eventFilterService'
import ViewConfigManager from '@/config/viewConfigManager'
import { DAY_OFFSET, DAYS_IN_WEEK, MONTH_OFFSET } from '@/constants'

// Mock external dependencies
vi.mock('@/services/eventFilterService')
vi.mock('@/config/viewConfigManager')

describe('SmartCalendar.vue', () => {
  let currentDate

  beforeEach(() => {
    currentDate = new Date('2025-01-15T12:00:00')
    vi.useFakeTimers()
    vi.setSystemTime(currentDate)

    // Reset mocks
    vi.clearAllMocks()

    // Setup default mock implementations
    ViewConfigManager.isViewValid.mockImplementation((view) =>
      ['day', 'week', 'month'].includes(view),
    )
    ViewConfigManager.getComponentName.mockImplementation((view) => {
      const components = { day: 'DayCalendar', week: 'WeekCalendar', month: 'MonthCalendar' }
      return components[view]
    })
    ViewConfigManager.getComponentProps.mockImplementation((view, baseProps) => ({
      ...baseProps,
      customProp: `prop-for-${view}`,
    }))
    EventFilterService.filterEventsByView.mockReturnValue([])
  })

  describe('Component Rendering and Structure', () => {
    it('should render the main container and card', () => {
      const wrapper = shallowMount(SmartCalendar)

      expect(wrapper.find('.container-fluid').exists()).toBe(true)
      expect(wrapper.find('.card').exists()).toBe(true)
    })

    it('should render CalendarHeader with correct props', () => {
      const wrapper = shallowMount(SmartCalendar)
      const header = wrapper.findComponent(CalendarHeader)

      expect(header.exists()).toBe(true)
      expect(header.props('currentDate')).toEqual(currentDate)
      expect(header.props('currentView')).toBe('month') // default initialView
    })

    it('should render dynamic calendar component based on current view', () => {
      const wrapper = shallowMount(SmartCalendar)

      // Default should be MonthCalendar
      expect(wrapper.findComponent(MonthCalendar).exists()).toBe(true)
      expect(wrapper.findComponent(WeekCalendar).exists()).toBe(false)
      expect(wrapper.findComponent(DayCalendar).exists()).toBe(false)
    })
  })

  describe('Props Handling', () => {
    it('should use default events when no events prop provided', () => {
      const wrapper = shallowMount(SmartCalendar)

      expect(wrapper.props('events')).toHaveLength(2)
      expect(wrapper.props('events')[0].title).toBe('Event 1')
      expect(wrapper.props('events')[1].title).toBe('Meeting')
    })

    it('should use custom events when provided', () => {
      const customEvents = [
        { id: 10, title: 'Custom Event', datetime: new Date(), type: 'primary' },
      ]

      const wrapper = shallowMount(SmartCalendar, {
        props: { events: customEvents },
      })

      expect(wrapper.props('events')).toEqual(customEvents)
    })

    it('should validate initialView prop', () => {
      const validViews = ['day', 'week', 'month']

      validViews.forEach((view) => {
        ViewConfigManager.isViewValid.mockReturnValue(true)

        const wrapper = shallowMount(SmartCalendar, {
          props: { initialView: view },
        })

        expect(wrapper.props('initialView')).toBe(view)
        expect(wrapper.vm.currentView).toBe(view)
      })
    })

    it('should validate weekStartsOn prop', () => {
      const validStarts = [0, 1]

      validStarts.forEach((startDay) => {
        const wrapper = shallowMount(SmartCalendar, {
          props: { weekStartsOn: startDay },
        })

        expect(wrapper.props('weekStartsOn')).toBe(startDay)
      })
    })
  })

  describe('Computed Properties', () => {
    it('should return correct calendar component name for each view', () => {
      const views = ['day', 'week', 'month']

      views.forEach((view) => {
        const wrapper = shallowMount(SmartCalendar, {
          data: () => ({ currentView: view }),
        })

        expect(ViewConfigManager.getComponentName).toHaveBeenCalledWith(view)
        expect(wrapper.vm.currentCalendarComponent).toBe(
          `${view.charAt(0).toUpperCase() + view.slice(1)}Calendar`,
        )
      })
    })

    it('should return correct props for calendar components', () => {
      const wrapper = shallowMount(SmartCalendar)

      const props = wrapper.vm.calendarComponentProps

      expect(ViewConfigManager.getComponentProps).toHaveBeenCalledWith('month', {
        weekStartsOn: 0,
      })
      expect(props.weekStartsOn).toBe(0)
      expect(props.customProp).toBe('prop-for-month')
    })

    it('should filter events using EventFilterService', () => {
      const mockEvents = [{ id: 1, title: 'Test Event', datetime: new Date(), type: 'primary' }]

      EventFilterService.filterEventsByView.mockReturnValue(mockEvents)

      const wrapper = shallowMount(SmartCalendar, {
        props: { events: mockEvents },
      })

      const filteredEvents = wrapper.vm.filteredEvents

      expect(EventFilterService.filterEventsByView).toHaveBeenCalledWith(
        mockEvents,
        currentDate,
        'month',
        0,
      )
      expect(filteredEvents).toEqual(mockEvents)
    })
  })

  describe('Event Handling Methods', () => {
    describe('handleDateNavigation', () => {
      it('should navigate to previous date for day view', () => {
        const wrapper = shallowMount(SmartCalendar)
        const testDate = new Date('2025-01-15')

        wrapper.vm.handleDateNavigation({
          direction: 'prev',
          view: 'day',
          currentDate: testDate,
        })

        expect(wrapper.vm.currentDate.getDate()).toBe(14) // Jan 14
      })

      it('should navigate to next date for week view', () => {
        const wrapper = shallowMount(SmartCalendar)
        const testDate = new Date('2025-01-15')

        wrapper.vm.handleDateNavigation({
          direction: 'next',
          view: 'week',
          currentDate: testDate,
        })

        expect(wrapper.vm.currentDate.getDate()).toBe(22) // Jan 15 + 7 days
      })

      it('should navigate to previous month for month view', () => {
        const wrapper = shallowMount(SmartCalendar)
        const testDate = new Date('2025-01-15')

        wrapper.vm.handleDateNavigation({
          direction: 'prev',
          view: 'month',
          currentDate: testDate,
        })

        expect(wrapper.vm.currentDate.getMonth()).toBe(11) // December
      })

      it('should handle invalid navigation direction gracefully', () => {
        const wrapper = shallowMount(SmartCalendar)
        const originalDate = new Date(wrapper.vm.currentDate)

        wrapper.vm.handleDateNavigation({
          direction: 'invalid',
          view: 'day',
          currentDate: new Date(originalDate),
        })

        // Date should remain unchanged
        expect(wrapper.vm.currentDate).toEqual(originalDate)
      })
    })

    describe('navigateToPrevious', () => {
      it('should subtract one day for day view', () => {
        const wrapper = shallowMount(SmartCalendar)
        const date = new Date('2025-01-15')

        wrapper.vm.navigateToPrevious(date, 'day')
        expect(date.getDate()).toBe(14)
      })

      it('should subtract 7 days for week view', () => {
        const wrapper = shallowMount(SmartCalendar)
        const date = new Date('2025-01-15')

        wrapper.vm.navigateToPrevious(date, 'week')
        expect(date.getDate()).toBe(8)
      })

      it('should subtract one month for month view', () => {
        const wrapper = shallowMount(SmartCalendar)
        const date = new Date('2025-01-15')

        wrapper.vm.navigateToPrevious(date, 'month')
        expect(date.getMonth()).toBe(11) // December
        expect(date.getFullYear()).toBe(2024)
      })
    })

    describe('navigateToNext', () => {
      it('should add one day for day view', () => {
        const wrapper = shallowMount(SmartCalendar)
        const date = new Date('2025-01-15')

        wrapper.vm.navigateToNext(date, 'day')
        expect(date.getDate()).toBe(16)
      })

      it('should add 7 days for week view', () => {
        const wrapper = shallowMount(SmartCalendar)
        const date = new Date('2025-01-15')

        wrapper.vm.navigateToNext(date, 'week')
        expect(date.getDate()).toBe(22)
      })

      it('should add one month for month view', () => {
        const wrapper = shallowMount(SmartCalendar)
        const date = new Date('2025-01-15')

        wrapper.vm.navigateToNext(date, 'month')
        expect(date.getMonth()).toBe(1) // February
        expect(date.getFullYear()).toBe(2025)
      })
    })

    describe('handleViewChange', () => {
      it('should update current view and date', () => {
        const wrapper = shallowMount(SmartCalendar)
        const newDate = new Date('2025-02-01')

        wrapper.vm.handleViewChange({
          view: 'week',
          currentDate: newDate,
        })

        expect(wrapper.vm.currentView).toBe('week')
        expect(wrapper.vm.currentDate).toEqual(newDate)
      })
    })

    describe('handleTodayClick', () => {
      it('should set current date to today and update view', () => {
        const wrapper = shallowMount(SmartCalendar)
        const today = new Date('2025-01-20')

        wrapper.vm.handleTodayClick({
          view: 'day',
          date: today,
        })

        expect(wrapper.vm.currentDate).toEqual(today)
        expect(wrapper.vm.currentView).toBe('day')
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty events array', () => {
      const wrapper = shallowMount(SmartCalendar, {
        props: { events: [] },
      })

      expect(wrapper.vm.filteredEvents).toEqual([])
      expect(EventFilterService.filterEventsByView).toHaveBeenCalledWith(
        [],
        currentDate,
        'month',
        0,
      )
    })

    it('should handle invalid view in handleDateNavigation', () => {
      const wrapper = shallowMount(SmartCalendar)
      const originalDate = new Date(wrapper.vm.currentDate)

      wrapper.vm.handleDateNavigation({
        direction: 'prev',
        view: 'invalid-view',
        currentDate: new Date(originalDate),
      })

      expect(wrapper.vm.currentDate).toEqual(originalDate)
    })

    it('should handle month boundary navigation', () => {
      const wrapper = shallowMount(SmartCalendar)

      // Test navigating from January to December
      const januaryDate = new Date('2025-01-01')
      wrapper.vm.navigateToPrevious(januaryDate, 'month')
      expect(januaryDate.getMonth()).toBe(11) // December
      expect(januaryDate.getFullYear()).toBe(2024)

      // Test navigating from December to January
      const decemberDate = new Date('2024-12-31')
      wrapper.vm.navigateToNext(decemberDate, 'month')
      expect(decemberDate.getMonth()).toBe(0) // January
      expect(decemberDate.getFullYear()).toBe(2025)
    })

    it('should handle leap year navigation', () => {
      const wrapper = shallowMount(SmartCalendar)
      const leapYearDate = new Date('2024-02-28') // Leap year

      wrapper.vm.navigateToNext(leapYearDate, 'day')
      expect(leapYearDate.getDate()).toBe(29) // February 29th
      expect(leapYearDate.getMonth()).toBe(1) // February
    })

    it('should maintain component state during rapid view changes', async () => {
      const wrapper = shallowMount(SmartCalendar)

      // Rapidly change views
      await wrapper.vm.handleViewChange({ view: 'week', currentDate: new Date('2025-01-15') })
      await wrapper.vm.handleViewChange({ view: 'day', currentDate: new Date('2025-01-16') })
      await wrapper.vm.handleViewChange({ view: 'month', currentDate: new Date('2025-02-01') })

      expect(wrapper.vm.currentView).toBe('month')
      expect(wrapper.vm.currentDate.getMonth()).toBe(1) // February
    })
  })

  describe('Emit Events', () => {
    it('should handle view-change event', async () => {
      const wrapper = shallowMount(SmartCalendar)
      const header = wrapper.findComponent(CalendarHeader)

      await header.vm.$emit('view-change', {
        view: 'week',
        currentDate: new Date('2025-01-15'),
      })

      expect(wrapper.vm.currentView).toBe('week')
      expect(wrapper.vm.currentDate).toEqual(new Date('2025-01-15'))
    })

    it('should handle today-click event', async () => {
      const wrapper = shallowMount(SmartCalendar)
      const header = wrapper.findComponent(CalendarHeader)
      const today = new Date('2025-01-20')

      await header.vm.$emit('today-click', {
        view: 'day',
        date: today,
      })

      expect(wrapper.vm.currentView).toBe('day')
      expect(wrapper.vm.currentDate).toEqual(today)
    })

    it('should handle date-navigator event', async () => {
      const wrapper = shallowMount(SmartCalendar)
      const header = wrapper.findComponent(CalendarHeader)
      const testDate = new Date('2025-01-15')

      await header.vm.$emit('date-navigator', {
        direction: 'next',
        view: 'week',
        currentDate: testDate,
      })

      expect(wrapper.vm.currentDate.getDate()).toBe(22) // Jan 15 + 7 days
    })
  })
})
