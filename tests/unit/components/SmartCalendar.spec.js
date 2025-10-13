// SmartCalendar.spec.js
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import SmartCalendar from '@/components/SmartCalendar.vue'

// Mock child components
vi.mock('./subcomponents/CalendarHeader.vue', () => ({
  default: {
    name: 'CalendarHeader',
    template: '<div class="calendar-header-mock"></div>',
    props: ['currentDate', 'currentView', 'navigationStyle'],
    emits: ['date-navigator', 'view-change', 'today-click'],
  },
}))

vi.mock('./subcomponents/MonthCalendar.vue', () => ({
  default: {
    name: 'MonthCalendar',
    template: '<div class="month-calendar-mock"></div>',
    props: ['currentDate', 'events', 'weekStartsOn', 'maxVisibleEvents'],
    emits: ['day-click', 'event-click', 'event-drag', 'event-drop', 'more-events-click'],
  },
}))

vi.mock('./subcomponents/WeekCalendar.vue', () => ({
  default: {
    name: 'WeekCalendar',
    template: '<div class="week-calendar-mock"></div>',
    props: ['currentDate', 'events', 'weekStartsOn', 'showWeekends'],
    emits: ['slot-click', 'event-drop'],
  },
}))

vi.mock('./subcomponents/DayCalendar.vue', () => ({
  default: {
    name: 'DayCalendar',
    template: '<div class="day-calendar-mock"></div>',
    props: ['currentDate', 'events', 'weekStartsOn', 'showTimeSlots'],
    emits: ['event-click', 'event-drag', 'event-drop', 'hour-click', 'event-select'],
  },
}))

describe('TESTING SmartCalendar.vue', () => {
  let wrapper
  let consoleSpy

  const mockEvents = [
    {
      id: 1,
      title: 'Event 1',
      desc: 'This is a sample description',
      datetime: new Date('2024-01-15T10:00:00'),
      type: 'primary',
    },
    {
      id: 2,
      title: 'Meeting',
      desc: 'Team meeting',
      datetime: new Date('2024-01-20T14:30:00'),
      type: 'success',
    },
    {
      id: 3,
      title: 'Past Event',
      desc: 'Old event',
      datetime: new Date('2023-12-25T09:00:00'),
      type: 'warning',
    },
    {
      id: 4,
      title: 'Future Event',
      desc: 'Future event',
      datetime: new Date('2024-02-01T16:00:00'),
      type: 'info',
    },
  ]

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    if (wrapper) wrapper.unmount()
  })

  // ==================== COMPONENT INITIALIZATION ====================
  describe('Component Initialization', () => {
    it('should initialize with default props and data', () => {
      wrapper = shallowMount(SmartCalendar)

      expect(wrapper.props().initialView).toBe('month')
      expect(wrapper.props().weekStartsOn).toBe(0)
      expect(wrapper.props().events).toHaveLength(2)
      expect(wrapper.vm.currentView).toBe('month')
      expect(wrapper.vm.currentDate).toBeInstanceOf(Date)
    })

    it('should initialize with custom props', () => {
      wrapper = shallowMount(SmartCalendar, {
        props: {
          events: mockEvents,
          initialView: 'week',
          weekStartsOn: 1,
        },
      })

      expect(wrapper.props().initialView).toBe('week')
      expect(wrapper.props().weekStartsOn).toBe(1)
      expect(wrapper.props().events).toEqual(mockEvents)
      expect(wrapper.vm.currentView).toBe('week')
    })

    it('should call mounted lifecycle hook', () => {
      wrapper = shallowMount(SmartCalendar)
      expect(consoleSpy).toHaveBeenCalledWith('SmartCalendar mounted with view:', 'month')
    })
  })

  // ==================== COMPUTED PROPERTIES ====================
  describe('Computed Properties', () => {
    describe('currentCalendarComponent', () => {
      it('should return correct component for each view type', () => {
        wrapper = shallowMount(SmartCalendar)

        wrapper.vm.currentView = 'month'
        expect(wrapper.vm.currentCalendarComponent).toBe('MonthCalendar')

        wrapper.vm.currentView = 'week'
        expect(wrapper.vm.currentCalendarComponent).toBe('WeekCalendar')

        wrapper.vm.currentView = 'day'
        expect(wrapper.vm.currentCalendarComponent).toBe('DayCalendar')
      })

      it('should default to MonthCalendar for unknown view', () => {
        wrapper = shallowMount(SmartCalendar)
        wrapper.vm.currentView = 'unknown'
        expect(wrapper.vm.currentCalendarComponent).toBe('MonthCalendar')
      })
    })

    describe('calendarComponentProps', () => {
      it('should return base props for all views', () => {
        wrapper = shallowMount(SmartCalendar)
        const props = wrapper.vm.calendarComponentProps
        expect(props).toHaveProperty('weekStartsOn', 0)
      })

      it('should include view-specific props for each view type', () => {
        // Week view
        wrapper = shallowMount(SmartCalendar, { props: { initialView: 'week' } })
        let props = wrapper.vm.calendarComponentProps
        expect(props).toHaveProperty('showWeekends', true)

        // Month view
        wrapper = shallowMount(SmartCalendar, { props: { initialView: 'month' } })
        props = wrapper.vm.calendarComponentProps
        expect(props).toHaveProperty('maxVisibleEvents', 3)

        // Day view
        wrapper = shallowMount(SmartCalendar, { props: { initialView: 'day' } })
        props = wrapper.vm.calendarComponentProps
        expect(props).toHaveProperty('showTimeSlots', true)

        // Unknown view
        wrapper = shallowMount(SmartCalendar)
        wrapper.vm.currentView = 'unknown'
        props = wrapper.vm.calendarComponentProps
        expect(props).toEqual({ weekStartsOn: 0 })
      })
    })

    describe('filteredEvents', () => {
      it('should filter events correctly for day view', () => {
        wrapper = shallowMount(SmartCalendar, {
          props: { events: mockEvents, initialView: 'day' },
        })
        wrapper.vm.currentDate = new Date('2024-01-15')

        const filtered = wrapper.vm.filteredEvents
        expect(filtered).toHaveLength(1)
        expect(filtered[0].id).toBe(1)
      })

      it('should filter events correctly for week view', () => {
        wrapper = shallowMount(SmartCalendar, {
          props: { events: mockEvents, initialView: 'week' },
        })
        wrapper.vm.currentDate = new Date('2024-01-15')

        const filtered = wrapper.vm.filteredEvents
        expect(filtered.length).toBeGreaterThanOrEqual(1)
      })

      it('should filter events correctly for month view', () => {
        wrapper = shallowMount(SmartCalendar, {
          props: { events: mockEvents, initialView: 'month' },
        })
        wrapper.vm.currentDate = new Date('2024-01-15')

        const filtered = wrapper.vm.filteredEvents
        expect(filtered.length).toBeGreaterThanOrEqual(1)
      })

      it('should return all events for unknown view', () => {
        wrapper = shallowMount(SmartCalendar, { props: { events: mockEvents } })
        wrapper.vm.currentView = 'unknown'

        const filtered = wrapper.vm.filteredEvents
        expect(filtered).toEqual(mockEvents)
      })

      // EDGE CASES for filteredEvents
      it('should handle events with startDate field instead of datetime', () => {
        const eventsWithStartDate = [
          {
            id: 1,
            title: 'Event with startDate',
            startDate: new Date('2024-01-15T10:00:00'),
          },
        ]

        wrapper = shallowMount(SmartCalendar, {
          props: { events: eventsWithStartDate, initialView: 'day' },
        })
        wrapper.vm.currentDate = new Date('2024-01-15')

        expect(wrapper.vm.filteredEvents).toHaveLength(1)
      })

      it('should handle events with date field instead of datetime', () => {
        const eventsWithDate = [
          {
            id: 1,
            title: 'Event with date',
            date: new Date('2024-01-15T10:00:00'),
          },
        ]

        wrapper = shallowMount(SmartCalendar, {
          props: { events: eventsWithDate, initialView: 'day' },
        })
        wrapper.vm.currentDate = new Date('2024-01-15')

        expect(wrapper.vm.filteredEvents).toHaveLength(1)
      })

      it('should handle empty events array', () => {
        wrapper = shallowMount(SmartCalendar, { props: { events: [] } })
        expect(wrapper.vm.filteredEvents).toHaveLength(0)
      })

      it('should handle events with missing date fields gracefully', () => {
        const eventsWithMissingDate = [
          {
            id: 1,
            title: 'Event without date',
            // Missing datetime, startDate, and date fields
          },
        ]

        wrapper = shallowMount(SmartCalendar, {
          props: { events: eventsWithMissingDate, initialView: 'day' },
        })

        // Should not crash and return empty array or handle gracefully
        expect(() => wrapper.vm.filteredEvents).not.toThrow()
      })
    })
  })

  // ==================== METHODS - DATE NAVIGATION ====================
  describe('Date Navigation Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(SmartCalendar)
    })

    describe('navigateToPrevious', () => {
      it('should navigate to previous month', () => {
        const initialDate = new Date('2024-06-15')
        wrapper.vm.currentDate = initialDate

        wrapper.vm.navigateToPrevious(new Date(initialDate), 'month')
        expect(wrapper.vm.currentDate.getMonth()).toBe(4) // May
      })

      it('should navigate to previous week', () => {
        const initialDate = new Date('2024-06-15')
        wrapper.vm.currentDate = initialDate

        wrapper.vm.navigateToPrevious(new Date(initialDate), 'week')
        expect(wrapper.vm.currentDate.getDate()).toBe(8)
      })

      it('should navigate to previous day', () => {
        const initialDate = new Date('2024-06-15')
        wrapper.vm.currentDate = initialDate

        wrapper.vm.navigateToPrevious(new Date(initialDate), 'day')
        expect(wrapper.vm.currentDate.getDate()).toBe(14)
      })

      // EDGE CASES
      it('should handle month navigation across year boundaries', () => {
        const januaryDate = new Date('2024-01-15')
        wrapper.vm.currentDate = januaryDate

        wrapper.vm.navigateToPrevious(new Date(januaryDate), 'month')
        expect(wrapper.vm.currentDate.getMonth()).toBe(11) // December
        expect(wrapper.vm.currentDate.getFullYear()).toBe(2023)
      })

      it('should handle leap year February navigation', () => {
        const marchDate = new Date('2024-03-01') // Leap year
        wrapper.vm.currentDate = marchDate

        wrapper.vm.navigateToPrevious(new Date(marchDate), 'month')
        expect(wrapper.vm.currentDate.getMonth()).toBe(1) // February
        expect(wrapper.vm.currentDate.getFullYear()).toBe(2024)
      })
    })

    describe('navigateToNext', () => {
      it('should navigate to next month', () => {
        const initialDate = new Date('2024-06-15')
        wrapper.vm.currentDate = initialDate

        wrapper.vm.navigateToNext(new Date(initialDate), 'month')
        expect(wrapper.vm.currentDate.getMonth()).toBe(6) // July
      })

      it('should navigate to next week', () => {
        const initialDate = new Date('2024-06-15')
        wrapper.vm.currentDate = initialDate

        wrapper.vm.navigateToNext(new Date(initialDate), 'week')
        expect(wrapper.vm.currentDate.getDate()).toBe(22)
      })

      it('should navigate to next day', () => {
        const initialDate = new Date('2024-06-15')
        wrapper.vm.currentDate = initialDate

        wrapper.vm.navigateToNext(new Date(initialDate), 'day')
        expect(wrapper.vm.currentDate.getDate()).toBe(16)
      })

      // EDGE CASES
      it('should handle month navigation across year boundaries', () => {
        const decemberDate = new Date('2024-12-15')
        wrapper.vm.currentDate = decemberDate

        wrapper.vm.navigateToNext(new Date(decemberDate), 'month')
        expect(wrapper.vm.currentDate.getMonth()).toBe(0) // January
        expect(wrapper.vm.currentDate.getFullYear()).toBe(2025)
      })

      it('should handle week navigation across month boundaries', () => {
        const endOfMonth = new Date('2024-01-31')
        wrapper.vm.currentDate = endOfMonth

        wrapper.vm.navigateToNext(new Date(endOfMonth), 'week')
        expect(wrapper.vm.currentDate.getMonth()).toBe(1) // February
      })
    })

    describe('handleDateNavigation', () => {
      it('should handle previous navigation', () => {
        const initialDate = new Date('2024-06-15')
        wrapper.vm.currentDate = initialDate

        wrapper.vm.handleDateNavigation({
          direction: 'prev',
          view: 'month',
          currentDate: initialDate,
        })

        expect(wrapper.vm.currentDate.getMonth()).toBe(4) // May
      })

      it('should handle next navigation', () => {
        const initialDate = new Date('2024-06-15')
        wrapper.vm.currentDate = initialDate

        wrapper.vm.handleDateNavigation({
          direction: 'next',
          view: 'month',
          currentDate: initialDate,
        })

        expect(wrapper.vm.currentDate.getMonth()).toBe(6) // July
      })

      // EDGE CASE: Unknown direction (should do nothing)
      it('should handle unknown direction gracefully', () => {
        const initialDate = new Date('2024-06-15')
        wrapper.vm.currentDate = initialDate

        wrapper.vm.handleDateNavigation({
          direction: 'unknown',
          view: 'month',
          currentDate: initialDate,
        })

        // Date should remain unchanged
        expect(wrapper.vm.currentDate).toEqual(initialDate)
      })
    })
  })

  // ==================== METHODS - VIEW MANAGEMENT ====================
  describe('View Management Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(SmartCalendar)
    })

    describe('handleViewChange', () => {
      it('should update current view and date', () => {
        const newDate = new Date('2024-06-15')

        wrapper.vm.handleViewChange({
          view: 'week',
          previousView: 'month',
          currentDate: newDate,
        })

        expect(wrapper.vm.currentView).toBe('week')
        expect(wrapper.vm.currentDate).toEqual(newDate)
      })

      it('should emit view-changed event', () => {
        const newDate = new Date('2024-06-15')

        wrapper.vm.handleViewChange({
          view: 'day',
          previousView: 'week',
          currentDate: newDate,
        })

        expect(wrapper.emitted('view-changed')).toBeTruthy()
        expect(wrapper.emitted('view-changed')[0]).toEqual([
          {
            newView: 'day',
            previousView: 'week',
            currentDate: newDate,
          },
        ])
      })

      // EDGE CASE: Rapid view switching
      it('should handle rapid view switching', () => {
        wrapper.vm.handleViewChange({
          view: 'week',
          previousView: 'month',
          currentDate: new Date(),
        })
        expect(wrapper.vm.currentView).toBe('week')

        wrapper.vm.handleViewChange({ view: 'day', previousView: 'week', currentDate: new Date() })
        expect(wrapper.vm.currentView).toBe('day')

        wrapper.vm.handleViewChange({ view: 'month', previousView: 'day', currentDate: new Date() })
        expect(wrapper.vm.currentView).toBe('month')
      })
    })

    describe('handleTodayClick', () => {
      it('should update current date and view', () => {
        const today = new Date()

        wrapper.vm.handleTodayClick({
          view: 'week',
          date: today,
        })

        expect(wrapper.vm.currentDate).toEqual(today)
        expect(wrapper.vm.currentView).toBe('week')
      })

      it('should emit today-clicked event', () => {
        const today = new Date()

        wrapper.vm.handleTodayClick({
          view: 'day',
          date: today,
        })

        expect(wrapper.emitted('today-clicked')).toBeTruthy()
        expect(wrapper.emitted('today-clicked')[0]).toEqual([
          {
            view: 'day',
            date: today,
          },
        ])
      })

      // EDGE CASE: Future date
      it('should handle future date in today click', () => {
        const futureDate = new Date('2030-01-01')

        wrapper.vm.handleTodayClick({
          view: 'month',
          date: futureDate,
        })

        expect(wrapper.vm.currentDate).toEqual(futureDate)
      })
    })
  })

  // ==================== METHODS - EVENT HANDLING ====================
  describe('Event Handling Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(SmartCalendar)
    })

    it('should handle event click and emit event', () => {
      const mockEvent = { id: 1, title: 'Test Event' }

      wrapper.vm.handleEventClick(mockEvent)

      expect(wrapper.emitted('event-clicked')).toBeTruthy()
      expect(wrapper.emitted('event-clicked')[0]).toEqual([mockEvent])
    })

    it('should handle event drop and emit event', () => {
      const mockEvent = { id: 1, title: 'Test Event', datetime: new Date() }

      wrapper.vm.handleEventDrop({
        event: mockEvent,
        newDate: new Date('2024-01-16'),
        originalDate: new Date('2024-01-15'),
      })

      expect(wrapper.emitted('event-moved')).toBeTruthy()
      expect(wrapper.emitted('event-moved')[0][0]).toMatchObject({
        event: mockEvent,
        newDate: expect.any(Date),
        originalDate: expect.any(Date),
      })
    })

    it('should handle day click and emit event', () => {
      const dayData = {
        date: new Date('2024-01-15'),
        isOtherMonth: false,
        events: [],
      }

      wrapper.vm.handleDayClick(dayData)

      expect(wrapper.emitted('day-clicked')).toBeTruthy()
      expect(wrapper.emitted('day-clicked')[0]).toEqual([dayData])
    })

    // EDGE CASES for event handling
    it('should handle event click with minimal event data', () => {
      const minimalEvent = { id: 1, title: 'Minimal Event' }

      expect(() => {
        wrapper.vm.handleEventClick(minimalEvent)
      }).not.toThrow()

      expect(wrapper.emitted('event-clicked')).toBeTruthy()
    })

    it('should handle day click with incomplete day data', () => {
      const minimalDayData = {
        date: new Date(),
        // Missing isOtherMonth and events
      }

      expect(() => {
        wrapper.vm.handleDayClick(minimalDayData)
      }).not.toThrow()

      expect(wrapper.emitted('day-clicked')).toBeTruthy()
    })
  })

  // ==================== COMPONENT RENDERING ====================
  describe('Component Rendering', () => {
    it('should render correct calendar component based on current view', async () => {
      wrapper = shallowMount(SmartCalendar)

      // Month view
      wrapper.vm.currentView = 'month'
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent({ name: 'MonthCalendar' }).exists()).toBe(true)

      // Week view
      wrapper.vm.currentView = 'week'
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent({ name: 'WeekCalendar' }).exists()).toBe(true)

      // Day view
      wrapper.vm.currentView = 'day'
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent({ name: 'DayCalendar' }).exists()).toBe(true)
    })

    it('should pass correct props to calendar components', () => {
      wrapper = shallowMount(SmartCalendar, {
        props: { events: mockEvents, weekStartsOn: 1 },
      })

      const monthCalendar = wrapper.findComponent({ name: 'MonthCalendar' })
      expect(monthCalendar.props().weekStartsOn).toBe(1)
      expect(monthCalendar.props().maxVisibleEvents).toBe(3)
      expect(monthCalendar.props().events).toEqual(wrapper.vm.filteredEvents)
    })
  })

  // ==================== PERFORMANCE & ERROR HANDLING ====================
  describe('Performance and Error Handling', () => {
    it('should handle large events array efficiently', () => {
      const largeEventsArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        title: `Event ${i}`,
        datetime: new Date(2024, 0, (i % 30) + 1),
        type: 'primary',
      }))

      wrapper = shallowMount(SmartCalendar, {
        props: { events: largeEventsArray },
      })

      // Should filter events without performance issues
      expect(wrapper.vm.filteredEvents).toBeDefined()
      expect(wrapper.vm.filteredEvents.length).toBeLessThanOrEqual(1000)
    })

    it('should handle invalid date objects in events gracefully', () => {
      const eventsWithInvalidDates = [
        {
          id: 1,
          title: 'Invalid Date Event',
          datetime: new Date('invalid-date'),
          type: 'primary',
        },
      ]

      wrapper = shallowMount(SmartCalendar, {
        props: { events: eventsWithInvalidDates },
      })

      // Component should not crash with invalid dates
      expect(() => wrapper.vm.filteredEvents).not.toThrow()
    })

    it('should clean up properly on unmount', () => {
      wrapper = shallowMount(SmartCalendar)

      // Simulate multiple operations
      wrapper.vm.handleViewChange({ view: 'week', previousView: 'month', currentDate: new Date() })
      wrapper.vm.handleTodayClick({ view: 'day', date: new Date() })

      // Unmount should work without errors
      expect(() => wrapper.unmount()).not.toThrow()
    })
  })

  // ==================== EVENT PROPAGATION ====================
  describe('Event Propagation', () => {
    it('should propagate events from child components', async () => {
      wrapper = shallowMount(SmartCalendar)

      // Simulate CalendarHeader emitting date-navigator event
      const header = wrapper.findComponent({ name: 'CalendarHeader' })
      await header.vm.$emit('date-navigator', {
        direction: 'next',
        view: 'month',
        currentDate: new Date(),
      })

      // SmartCalendar should handle the event
      expect(wrapper.vm.currentDate).toBeDefined()
    })

    it('should propagate view-change event from header', async () => {
      wrapper = shallowMount(SmartCalendar)

      const header = wrapper.findComponent({ name: 'CalendarHeader' })
      const newDate = new Date('2024-06-15')

      await header.vm.$emit('view-change', {
        view: 'week',
        previousView: 'month',
        currentDate: newDate,
      })

      expect(wrapper.vm.currentView).toBe('week')
      expect(wrapper.vm.currentDate).toEqual(newDate)
    })

    it('should propagate today-click event from header', async () => {
      wrapper = shallowMount(SmartCalendar)

      const header = wrapper.findComponent({ name: 'CalendarHeader' })
      const today = new Date()

      await header.vm.$emit('today-click', {
        view: 'day',
        date: today,
      })

      expect(wrapper.vm.currentView).toBe('day')
      expect(wrapper.vm.currentDate).toEqual(today)
    })
  })
})
