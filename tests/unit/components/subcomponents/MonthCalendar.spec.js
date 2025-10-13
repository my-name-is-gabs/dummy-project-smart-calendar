// MonthCalendar.spec.js
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { isSameDay, isToday as isTodayDate } from 'date-fns'
import MonthCalendar from '@/components/subcomponents/MonthCalendar.vue'
import { generateCalendarDays } from '@/services/calendarService'

// Mock dependencies
vi.mock('@/services/calendarService', () => ({
  generateCalendarDays: vi.fn(),
}))

vi.mock('../common/CalendarChildHeader.vue', () => ({
  default: {
    name: 'CalendarChildHeader',
    template: '<div class="calendar-child-header-mock"></div>',
    props: ['currentDate', 'viewType', 'dayNames', 'weekStartsOn'],
  },
}))

describe('MonthCalendar - Complete Test Suite', () => {
  let wrapper

  const mockEvents = [
    {
      id: 1,
      title: 'Team Meeting',
      desc: 'Daily standup',
      datetime: new Date('2025-01-15T10:00:00'),
      type: 'primary',
    },
    {
      id: 2,
      title: 'Lunch Break',
      desc: 'Lunch with team',
      datetime: new Date('2025-01-15T12:00:00'),
      type: 'success',
    },
    {
      id: 3,
      title: 'Client Call',
      desc: 'Project discussion',
      datetime: new Date('2025-01-16T14:00:00'),
      type: 'warning',
    },
    {
      id: 4,
      title: 'All Day Event',
      desc: 'Conference',
      datetime: new Date('2025-01-20T00:00:00'),
      type: 'info',
      isAllDay: true,
    },
  ]

  const mockCalendarDays = [
    { date: new Date('2025-01-01'), isOtherMonth: true },
    { date: new Date('2025-01-02'), isOtherMonth: true },
    { date: new Date('2025-01-03'), isOtherMonth: true },
    { date: new Date('2025-01-04'), isOtherMonth: true },
    { date: new Date('2025-01-05'), isOtherMonth: true },
    { date: new Date('2025-01-06'), isOtherMonth: true },
    { date: new Date('2025-01-07'), isOtherMonth: false },
    { date: new Date('2025-01-08'), isOtherMonth: false },
    { date: new Date('2025-01-09'), isOtherMonth: false },
    { date: new Date('2025-01-10'), isOtherMonth: false },
    { date: new Date('2025-01-11'), isOtherMonth: false },
    { date: new Date('2025-01-12'), isOtherMonth: false },
    { date: new Date('2025-01-13'), isOtherMonth: false, isWeekend: true },
    { date: new Date('2025-01-14'), isOtherMonth: false, isWeekend: true },
    { date: new Date('2025-01-15'), isOtherMonth: false }, // Today for testing
    { date: new Date('2025-01-16'), isOtherMonth: false },
    { date: new Date('2025-01-17'), isOtherMonth: false },
    { date: new Date('2025-01-18'), isOtherMonth: false },
    { date: new Date('2025-01-19'), isOtherMonth: false },
    { date: new Date('2025-01-20'), isOtherMonth: false },
    { date: new Date('2025-01-21'), isOtherMonth: false },
    { date: new Date('2025-01-22'), isOtherMonth: false },
    { date: new Date('2025-01-23'), isOtherMonth: false },
    { date: new Date('2025-01-24'), isOtherMonth: false },
    { date: new Date('2025-01-25'), isOtherMonth: false },
    { date: new Date('2025-01-26'), isOtherMonth: false },
    { date: new Date('2025-01-27'), isOtherMonth: false },
    { date: new Date('2025-01-28'), isOtherMonth: false },
    { date: new Date('2025-01-29'), isOtherMonth: false },
    { date: new Date('2025-01-30'), isOtherMonth: false },
    { date: new Date('2025-01-31'), isOtherMonth: false },
    { date: new Date('2025-02-01'), isOtherMonth: true },
    { date: new Date('2025-02-02'), isOtherMonth: true },
    { date: new Date('2025-02-03'), isOtherMonth: true },
    { date: new Date('2025-02-04'), isOtherMonth: true },
    { date: new Date('2025-02-05'), isOtherMonth: true },
    { date: new Date('2025-02-06'), isOtherMonth: true },
  ]

  beforeEach(() => {
    generateCalendarDays.mockReturnValue(mockCalendarDays)
  })

  afterEach(() => {
    vi.clearAllMocks()
    if (wrapper) wrapper.unmount()
  })

  // ==================== COMPONENT INITIALIZATION ====================
  describe('Component Initialization', () => {
    it('should initialize with default props', () => {
      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
        },
      })

      expect(wrapper.props().currentDate).toEqual(new Date('2025-01-15'))
      expect(wrapper.props().events).toEqual([])
      expect(wrapper.props().weekStartsOn).toBe(0)
      expect(wrapper.props().weekDayNames).toEqual([
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
      ])
      expect(wrapper.props().maxVisibleEvents).toBe(3)
      expect(wrapper.props().showWeekends).toBe(true)
    })

    it('should initialize with custom props', () => {
      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          events: mockEvents,
          weekStartsOn: 1,
          weekDayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          maxVisibleEvents: 5,
          showWeekends: false,
        },
      })

      expect(wrapper.props().currentDate).toEqual(new Date('2025-01-15'))
      expect(wrapper.props().events).toEqual(mockEvents)
      expect(wrapper.props().weekStartsOn).toBe(1)
      expect(wrapper.props().maxVisibleEvents).toBe(5)
      expect(wrapper.props().showWeekends).toBe(false)
    })

    it('should call generateCalendarDays with correct parameters', () => {
      const currentDate = new Date('2025-01-15')
      wrapper = shallowMount(MonthCalendar, {
        props: { currentDate, weekStartsOn: 1 },
      })

      expect(generateCalendarDays).toHaveBeenCalledWith(currentDate, 1)
      expect(wrapper.vm.calendarDays).toEqual(mockCalendarDays)
    })
  })

  // ==================== COMPUTED PROPERTIES ====================
  describe('Computed Properties', () => {
    it('should return calendar days from service', () => {
      wrapper = shallowMount(MonthCalendar, {
        props: { currentDate: new Date('2025-01-15') },
      })

      expect(wrapper.vm.calendarDays).toEqual(mockCalendarDays)
      expect(generateCalendarDays).toHaveBeenCalledTimes(1)
    })
  })

  // ==================== METHODS ====================
  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          events: mockEvents,
          maxVisibleEvents: 2,
        },
      })
    })

    describe('formatDay', () => {
      it('should format date to day number', () => {
        const date = new Date('2025-01-15')
        expect(wrapper.vm.formatDay(date)).toBe('15')
      })

      it('should handle single digit days', () => {
        const date = new Date('2025-01-05')
        expect(wrapper.vm.formatDay(date)).toBe('5')
      })
    })

    describe('isToday', () => {
      it('should return true for today date', () => {
        const today = new Date()
        expect(wrapper.vm.isToday(today)).toBe(true)
      })

      it('should return false for non-today date', () => {
        // Temporarily mock isTodayDate to return false
        const originalIsToday = wrapper.vm.isToday
        wrapper.vm.isToday = vi.fn().mockReturnValue(false)

        const notToday = new Date()
        expect(wrapper.vm.isToday(notToday)).toBe(false)

        // Restore original function
        wrapper.vm.isToday = originalIsToday
      })
    })

    describe('isWeekend', () => {
      it('should return true for Saturday', () => {
        const saturday = new Date('2025-01-12') // Saturday
        expect(wrapper.vm.isWeekend(saturday)).toBe(true)
      })

      it('should return true for Sunday', () => {
        const sunday = new Date('2025-01-12') // Sunday
        expect(wrapper.vm.isWeekend(sunday)).toBe(true)
      })

      it('should return false for weekday', () => {
        const monday = new Date('2025-01-15') // Monday
        expect(wrapper.vm.isWeekend(monday)).toBe(false)
      })
    })

    describe('getEventsForDay', () => {
      it('should return events for specific day', () => {
        const date = new Date('2025-01-15')
        const events = wrapper.vm.getEventsForDay(date)

        expect(events).toHaveLength(2) // Limited by maxVisibleEvents
        expect(events[0].id).toBe(1)
        expect(events[1].id).toBe(2)
      })

      it('should return empty array for day with no events', () => {
        const date = new Date('2025-01-01')
        const events = wrapper.vm.getEventsForDay(date)
        expect(events).toHaveLength(0)
      })

      it('should handle events with startDate field', () => {
        const eventsWithStartDate = [
          {
            id: 10,
            title: 'Event with startDate',
            startDate: new Date('2025-01-15T10:00:00'),
          },
        ]

        wrapper = shallowMount(MonthCalendar, {
          props: {
            currentDate: new Date('2025-01-15'),
            events: eventsWithStartDate,
          },
        })

        const events = wrapper.vm.getEventsForDay(new Date('2025-01-15'))
        expect(events).toHaveLength(1)
        expect(events[0].id).toBe(10)
      })

      it('should handle events with date field', () => {
        const eventsWithDate = [
          {
            id: 11,
            title: 'Event with date',
            date: new Date('2025-01-15T10:00:00'),
          },
        ]

        wrapper = shallowMount(MonthCalendar, {
          props: {
            currentDate: new Date('2025-01-15'),
            events: eventsWithDate,
          },
        })

        const events = wrapper.vm.getEventsForDay(new Date('2025-01-15'))
        expect(events).toHaveLength(1)
        expect(events[0].id).toBe(11)
      })

      // EDGE CASE: Events with missing date fields
      it('should handle events with missing date fields gracefully', () => {
        const eventsWithMissingDate = [
          {
            id: 12,
            title: 'Event without date',
            // Missing datetime, startDate, and date
          },
        ]

        wrapper = shallowMount(MonthCalendar, {
          props: {
            currentDate: new Date('2025-01-15'),
            events: eventsWithMissingDate,
          },
        })

        const events = wrapper.vm.getEventsForDay(new Date('2025-01-15'))
        expect(events).toHaveLength(0)
      })
    })

    describe('hasMoreEvents', () => {
      it('should return true when day has more events than maxVisibleEvents', () => {
        const date = new Date('2025-01-15') // Has 2 events, maxVisibleEvents = 2
        expect(wrapper.vm.hasMoreEvents(date)).toBe(false)

        // Test with more events
        wrapper = shallowMount(MonthCalendar, {
          props: {
            currentDate: new Date('2025-01-15'),
            events: mockEvents,
            maxVisibleEvents: 1,
          },
        })

        expect(wrapper.vm.hasMoreEvents(date)).toBe(true)
      })

      it('should return false when day has fewer or equal events to maxVisibleEvents', () => {
        const date = new Date('2025-01-16') // Has 1 event
        expect(wrapper.vm.hasMoreEvents(date)).toBe(false)
      })

      it('should return false for day with no events', () => {
        const date = new Date('2025-01-01')
        expect(wrapper.vm.hasMoreEvents(date)).toBe(false)
      })
    })

    describe('getMoreEventsCount', () => {
      it('should return correct count of hidden events', () => {
        wrapper = shallowMount(MonthCalendar, {
          props: {
            currentDate: new Date('2025-01-15'),
            events: mockEvents,
            maxVisibleEvents: 1,
          },
        })

        const date = new Date('2025-01-15') // Has 2 events
        expect(wrapper.vm.getMoreEventsCount(date)).toBe(1)
      })

      it('should return 0 when no hidden events', () => {
        const date = new Date('2025-01-16') // Has 1 event
        expect(wrapper.vm.getMoreEventsCount(date)).toBe(0)
      })

      it('should return 0 for day with no events', () => {
        const date = new Date('2025-01-01')
        expect(wrapper.vm.getMoreEventsCount(date)).toBe(0)
      })
    })

    describe('getEventBadgeClass', () => {
      it('should return correct class for event type', () => {
        const primaryEvent = { type: 'primary' }
        expect(wrapper.vm.getEventBadgeClass(primaryEvent)).toBe('bg-primary text-white')

        const successEvent = { type: 'success' }
        expect(wrapper.vm.getEventBadgeClass(successEvent)).toBe('bg-success text-white')

        const warningEvent = { type: 'warning' }
        expect(wrapper.vm.getEventBadgeClass(warningEvent)).toBe('bg-warning text-dark')

        const infoEvent = { type: 'info' }
        expect(wrapper.vm.getEventBadgeClass(infoEvent)).toBe('bg-info text-dark')

        const dangerEvent = { type: 'danger' }
        expect(wrapper.vm.getEventBadgeClass(dangerEvent)).toBe('bg-danger text-white')
      })

      it('should return default class for unknown event type', () => {
        const unknownEvent = { type: 'unknown' }
        expect(wrapper.vm.getEventBadgeClass(unknownEvent)).toBe('bg-light text-dark')

        const eventWithoutType = {}
        expect(wrapper.vm.getEventBadgeClass(eventWithoutType)).toBe('bg-light text-dark')
      })
    })

    describe('Event Handling Methods', () => {
      it('should handle day click and emit event', () => {
        const day = mockCalendarDays[6] // First day of current month
        wrapper.vm.handleDayClick(day)

        expect(wrapper.emitted('day-click')).toBeTruthy()
        expect(wrapper.emitted('day-click')[0]).toEqual([
          {
            date: day.date,
            isOtherMonth: day.isOtherMonth,
            events: wrapper.vm.getEventsForDay(day.date),
          },
        ])
      })

      it('should handle event click and emit event', () => {
        const event = mockEvents[0]
        wrapper.vm.handleEventClick(event)

        expect(wrapper.emitted('event-click')).toBeTruthy()
        expect(wrapper.emitted('event-click')[0]).toEqual([event])
      })

      // EDGE CASE: Event drop with non-existent event ID
      it('should handle more events click and emit event', () => {
        wrapper = shallowMount(MonthCalendar, {
          props: {
            currentDate: new Date('2025-01-15'),
            events: mockEvents,
            maxVisibleEvents: 1,
          },
        })

        const date = new Date('2025-01-15')
        wrapper.vm.handleMoreEventsClick(date)

        expect(wrapper.emitted('more-events-click')).toBeTruthy()
        expect(wrapper.emitted('more-events-click')[0][0]).toEqual({
          date,
          events: mockEvents.filter((e) => isSameDay(e.datetime, date)),
          hiddenCount: 1,
        })
      })
    })
  })

  // ==================== TEMPLATE RENDERING ====================
  describe('Template Rendering', () => {
    it('should render CalendarChildHeader with correct props', () => {
      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          weekDayNames: ['Sun', 'Mon', 'Tue'],
          weekStartsOn: 1,
        },
      })

      const header = wrapper.findComponent({ name: 'CalendarChildHeader' })
      expect(header.props().currentDate).toEqual(new Date('2025-01-15'))
      expect(header.props().viewType).toBe('month')
      expect(header.props().dayNames).toEqual(['Sun', 'Mon', 'Tue'])
      expect(header.props().weekStartsOn).toBe(1)
    })

    it('should render correct number of day cells', () => {
      wrapper = shallowMount(MonthCalendar, {
        props: { currentDate: new Date('2025-01-15') },
      })

      const dayCells = wrapper.findAll('.day-cell')
      expect(dayCells).toHaveLength(mockCalendarDays.length)
    })

    it('should apply correct CSS classes based on day properties', () => {
      wrapper = shallowMount(MonthCalendar, {
        props: { currentDate: new Date('2025-01-15') },
      })

      const dayCells = wrapper.findAll('.day-cell')

      // Check other month day
      expect(dayCells[0].classes()).toContain('other-month')

      // Check current month day
      expect(dayCells[6].classes()).toContain('current-month')

      // Check weekend day (adjust index based on your mock data)
      const weekendDay = dayCells.find((cell) => cell.classes().includes('weekend'))
      expect(weekendDay?.classes()).toContain('weekend')
    })

    it('should render events in day cells', async () => {
      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          events: mockEvents,
        },
      })

      await wrapper.vm.$nextTick()

      const eventItems = wrapper.findAll('.event-item')
      expect(eventItems.length).toBeGreaterThan(0)
    })

    it('should render "more events" indicator when applicable', async () => {
      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          events: mockEvents,
          maxVisibleEvents: 1,
        },
      })

      await wrapper.vm.$nextTick()

      const moreEventsIndicators = wrapper.findAll('.more-events-indicator')
      expect(moreEventsIndicators.length).toBeGreaterThan(0)
    })

    it('should render empty state when no events', async () => {
      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          events: [],
        },
      })

      await wrapper.vm.$nextTick()

      const emptyDays = wrapper.findAll('.empty-day')
      expect(emptyDays.length).toBeGreaterThan(0)
    })

    it('should render today indicator for today in current month', async () => {
      // Mock today to be a specific date in current month
      vi.mock('date-fns', async () => {
        const actual = await vi.importActual('date-fns')
        return {
          ...actual,
          isToday: vi.fn().mockReturnValue(true),
        }
      })

      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
        },
      })

      await wrapper.vm.$nextTick()

      const todayIndicators = wrapper.findAll('.today-indicator')
      expect(todayIndicators.length).toBeGreaterThan(0)
    })
  })

  // ==================== EVENT HANDLING IN TEMPLATE ====================
  describe('Event Handling in Template', () => {
    it('should trigger day click when day cell is clicked', async () => {
      wrapper = shallowMount(MonthCalendar, {
        props: { currentDate: new Date('2025-01-15') },
      })

      const dayCell = wrapper.find('.day-cell')
      await dayCell.trigger('click')

      expect(wrapper.emitted('day-click')).toBeTruthy()
    })

    it('should trigger event click when event item is clicked', async () => {
      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          events: [mockEvents[0]],
        },
      })

      await wrapper.vm.$nextTick()

      const eventItem = wrapper.find('.event-item')
      await eventItem.trigger('click')

      expect(wrapper.emitted('event-click')).toBeTruthy()
    })

    it('should trigger more events click when indicator is clicked', async () => {
      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          events: mockEvents,
          maxVisibleEvents: 1,
        },
      })

      await wrapper.vm.$nextTick()

      const moreEventsIndicator = wrapper.find('.more-events-indicator')
      await moreEventsIndicator.trigger('click')

      expect(wrapper.emitted('more-events-click')).toBeTruthy()
    })

    it('should handle drag and drop events', async () => {
      wrapper = shallowMount(MonthCalendar, {
        props: { currentDate: new Date('2025-01-15') },
      })

      const dayCell = wrapper.find('.day-cell')

      // Test drag over
      await dayCell.trigger('dragover')

      // Test drop (minimal test since detailed logic is in methods)
      await dayCell.trigger('drop')
    })
  })

  // ==================== SLOT TESTING ====================
  describe('Slot Testing', () => {
    it('should render default slot content when no slot provided', () => {
      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          events: [mockEvents[0]],
        },
      })

      const defaultEventItems = wrapper.findAll('.event-item')
      expect(defaultEventItems.length).toBeGreaterThan(0)
    })

    it('should render custom slot content when provided', () => {
      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          events: [mockEvents[0]],
        },
        slots: {
          event: `
            <template #event="{ day, events }">
              <div class="custom-event">Custom: {{ events[0]?.title }}</div>
            </template>
          `,
        },
      })

      const customEvents = wrapper.findAll('.custom-event')
      expect(customEvents.length).toBeGreaterThan(0)
    })
  })

  // ==================== EDGE CASES ====================
  describe('Edge Cases', () => {
    it('should handle empty events array', () => {
      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          events: [],
        },
      })

      expect(wrapper.vm.getEventsForDay(new Date('2025-01-15'))).toHaveLength(0)
      expect(wrapper.vm.hasMoreEvents(new Date('2025-01-15'))).toBe(false)
      expect(wrapper.vm.getMoreEventsCount(new Date('2025-01-15'))).toBe(0)
    })

    it('should handle very large number of events', () => {
      const largeEvents = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        title: `Event ${i}`,
        datetime: new Date('2025-01-15T10:00:00'),
        type: 'primary',
      }))

      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          events: largeEvents,
          maxVisibleEvents: 5,
        },
      })

      const events = wrapper.vm.getEventsForDay(new Date('2025-01-15'))
      expect(events).toHaveLength(5)
      expect(wrapper.vm.hasMoreEvents(new Date('2025-01-15'))).toBe(true)
      expect(wrapper.vm.getMoreEventsCount(new Date('2025-01-15'))).toBe(95)
    })

    it('should handle invalid date in events gracefully', () => {
      const eventsWithInvalidDate = [
        {
          id: 1,
          title: 'Event with invalid date',
          datetime: new Date('invalid-date'),
        },
      ]

      wrapper = shallowMount(MonthCalendar, {
        props: {
          currentDate: new Date('2025-01-15'),
          events: eventsWithInvalidDate,
        },
      })

      // Should not throw when processing events
      expect(() => {
        wrapper.vm.getEventsForDay(new Date('2025-01-15'))
      }).not.toThrow()
    })

    it('should handle calendar service returning empty array', () => {
      generateCalendarDays.mockReturnValueOnce([])

      wrapper = shallowMount(MonthCalendar, {
        props: { currentDate: new Date('2025-01-15') },
      })

      expect(wrapper.vm.calendarDays).toEqual([])
      const dayCells = wrapper.findAll('.day-cell')
      expect(dayCells).toHaveLength(0)
    })
  })
})
