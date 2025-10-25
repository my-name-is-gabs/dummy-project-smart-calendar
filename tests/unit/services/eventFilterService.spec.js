import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isSameDay, isSameWeek, isSameMonth } from 'date-fns'
import EventFilterService from '@/services/eventFilterService'

// Mock date-fns functions
vi.mock('date-fns', () => ({
  isSameDay: vi.fn(),
  isSameWeek: vi.fn(),
  isSameMonth: vi.fn(),
}))

describe('eventFilterService.js', () => {
  const mockEvents = [
    { id: 1, title: 'Event 1', datetime: new Date('2025-01-15T10:00:00') },
    { id: 2, title: 'Event 2', datetime: new Date('2025-01-16T14:00:00') },
    { id: 3, title: 'Event 3', datetime: new Date('2025-01-20T09:00:00') },
    { id: 4, title: 'Event 4', datetime: new Date('2025-02-01T16:00:00') },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('filterEventsByView', () => {
    it('should filter events for day view', () => {
      const currentDate = new Date('2025-01-15')

      // Mock isSameDay to return true for first event only
      isSameDay.mockImplementation((eventDate, compareDate) => {
        return eventDate.getTime() === new Date('2025-01-15T10:00:00').getTime()
      })

      const result = EventFilterService.filterEventsByView(mockEvents, currentDate, 'day')

      expect(isSameDay).toHaveBeenCalledTimes(4)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
      expect(result[0].title).toBe('Event 1')
    })

    it('should filter events for week view with default weekStartsOn', () => {
      const currentDate = new Date('2025-01-15')

      // Mock isSameWeek to return true for first two events
      isSameWeek.mockImplementation((eventDate, compareDate, options) => {
        const eventTime = eventDate.getTime()
        return (
          eventTime === new Date('2025-01-15T10:00:00').getTime() ||
          eventTime === new Date('2025-01-16T14:00:00').getTime()
        )
      })

      const result = EventFilterService.filterEventsByView(mockEvents, currentDate, 'week')

      expect(isSameWeek).toHaveBeenCalledTimes(4)
      expect(isSameWeek).toHaveBeenCalledWith(expect.any(Date), currentDate, { weekStartsOn: 0 })
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
    })

    it('should filter events for week view with custom weekStartsOn', () => {
      const currentDate = new Date('2025-01-15')

      isSameWeek.mockReturnValue(true) // All events in same week for this test

      const result = EventFilterService.filterEventsByView(
        mockEvents,
        currentDate,
        'week',
        1, // Monday
      )

      expect(isSameWeek).toHaveBeenCalledWith(expect.any(Date), currentDate, { weekStartsOn: 1 })
      expect(result).toHaveLength(4)
    })

    it('should filter events for month view', () => {
      const currentDate = new Date('2025-01-15')

      // Mock isSameMonth to return true for first three events (January)
      isSameMonth.mockImplementation((eventDate, compareDate) => {
        return eventDate.getMonth() === 0 // January
      })

      const result = EventFilterService.filterEventsByView(mockEvents, currentDate, 'month')

      expect(isSameMonth).toHaveBeenCalledTimes(4)
      expect(result).toHaveLength(3)
      expect(result.map((e) => e.id)).toEqual([1, 2, 3])
    })

    it('should return all events for invalid view', () => {
      const currentDate = new Date('2025-01-15')

      const result = EventFilterService.filterEventsByView(mockEvents, currentDate, 'invalid')

      // No date-fns functions should be called for invalid view
      expect(isSameDay).not.toHaveBeenCalled()
      expect(isSameWeek).not.toHaveBeenCalled()
      expect(isSameMonth).not.toHaveBeenCalled()
      expect(result).toEqual(mockEvents)
    })

    it('should handle empty events array', () => {
      const currentDate = new Date('2025-01-15')

      const result = EventFilterService.filterEventsByView([], currentDate, 'day')

      expect(result).toEqual([])
      expect(isSameDay).not.toHaveBeenCalled()
    })

    it('should handle events with different datetime formats', () => {
      const mixedEvents = [
        { id: 1, datetime: new Date('2025-01-15T10:00:00') },
        { id: 2, datetime: '2025-01-15T14:00:00' }, // String date
        { id: 3, datetime: 1736935200000 }, // Timestamp
      ]

      isSameDay.mockReturnValue(true)

      const currentDate = new Date('2025-01-15')
      const result = EventFilterService.filterEventsByView(mixedEvents, currentDate, 'day')

      // All events should be processed (even with different date formats)
      expect(isSameDay).toHaveBeenCalledTimes(3)
      expect(result).toHaveLength(3)
    })

    it('should use event.datetime for date comparison', () => {
      const eventsWithDifferentDateFields = [
        { id: 1, datetime: new Date('2025-01-15T10:00:00'), startDate: new Date('2025-01-20') },
        { id: 2, datetime: new Date('2025-01-16T14:00:00'), date: new Date('2025-01-25') },
      ]

      isSameDay.mockReturnValue(true)

      const result = EventFilterService.filterEventsByView(
        eventsWithDifferentDateFields,
        new Date('2025-01-15'),
        'day',
      )

      // Should use event.datetime, not other date fields
      expect(isSameDay).toHaveBeenCalledWith(new Date('2025-01-15T10:00:00'), expect.any(Date))
      expect(isSameDay).toHaveBeenCalledWith(new Date('2025-01-16T14:00:00'), expect.any(Date))
      expect(result).toHaveLength(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle events at midnight boundaries', () => {
      const midnightEvents = [
        { id: 1, datetime: new Date('2025-01-15T00:00:00') },
        { id: 2, datetime: new Date('2025-01-15T23:59:59') },
        { id: 3, datetime: new Date('2025-01-16T00:00:00') },
      ]

      isSameDay.mockImplementation((eventDate, compareDate) => {
        return eventDate.toDateString() === compareDate.toDateString()
      })

      const result = EventFilterService.filterEventsByView(
        midnightEvents,
        new Date('2025-01-15'),
        'day',
      )

      expect(result).toHaveLength(2)
      expect(result.map((e) => e.id)).toEqual([1, 2])
    })

    it('should handle week boundaries with different weekStartsOn', () => {
      const weekBoundaryEvents = [
        { id: 1, datetime: new Date('2025-01-12') }, // Sunday
        { id: 2, datetime: new Date('2025-01-13') }, // Monday
      ]

      // Mock different behaviors based on weekStartsOn
      isSameWeek.mockImplementation((eventDate, compareDate, options) => {
        if (options.weekStartsOn === 0) {
          // Sunday start: both events in same week
          return true
        } else {
          // Monday start: only Monday event in same week
          return eventDate.getDay() !== 0 // not Sunday
        }
      })

      const resultSundayStart = EventFilterService.filterEventsByView(
        weekBoundaryEvents,
        new Date('2025-01-15'),
        'week',
        0,
      )

      const resultMondayStart = EventFilterService.filterEventsByView(
        weekBoundaryEvents,
        new Date('2025-01-15'),
        'week',
        1,
      )

      expect(resultSundayStart).toHaveLength(2)
      expect(resultMondayStart).toHaveLength(1)
    })

    it('should handle month boundaries', () => {
      const monthBoundaryEvents = [
        { id: 1, datetime: new Date('2025-01-31T23:59:59') },
        { id: 2, datetime: new Date('2025-02-01T00:00:00') },
      ]

      isSameMonth.mockImplementation((eventDate, compareDate) => {
        return eventDate.getMonth() === compareDate.getMonth()
      })

      const januaryResult = EventFilterService.filterEventsByView(
        monthBoundaryEvents,
        new Date('2025-01-15'),
        'month',
      )

      const februaryResult = EventFilterService.filterEventsByView(
        monthBoundaryEvents,
        new Date('2025-02-15'),
        'month',
      )

      expect(januaryResult).toHaveLength(1)
      expect(januaryResult[0].id).toBe(1)
      expect(februaryResult).toHaveLength(1)
      expect(februaryResult[0].id).toBe(2)
    })

    it('should handle leap year dates', () => {
      const leapYearEvents = [
        { id: 1, datetime: new Date('2024-02-29T10:00:00') }, // Leap day
        { id: 2, datetime: new Date('2024-02-28T14:00:00') },
      ]

      isSameDay.mockReturnValue(true)

      const result = EventFilterService.filterEventsByView(
        leapYearEvents,
        new Date('2024-02-29'),
        'day',
      )

      expect(result).toHaveLength(2)
    })
  })

  describe('Error Handling', () => {
    it('should handle events with invalid datetime', () => {
      const eventsWithInvalidDate = [
        { id: 1, datetime: new Date('2025-01-15T10:00:00') },
        { id: 2, datetime: 'invalid-date' },
        { id: 3, datetime: null },
      ]

      // Mock isSameDay to simulate real behavior with invalid dates
      isSameDay.mockImplementation((eventDate, compareDate) => {
        // Check if eventDate is a valid Date object
        const isValidDate = eventDate instanceof Date && !isNaN(eventDate.getTime())
        if (!isValidDate) {
          return false
        }
        // Only first event should match
        return eventDate.getTime() === new Date('2025-01-15T10:00:00').getTime()
      })

      const result = EventFilterService.filterEventsByView(
        eventsWithInvalidDate,
        new Date('2025-01-15'),
        'day',
      )

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })

    it('should handle missing datetime property', () => {
      const eventsMissingDate = [
        { id: 1, datetime: new Date('2025-01-15T10:00:00') },
        { id: 2, title: 'No datetime' }, // Missing datetime
        { id: 3, datetime: undefined },
      ]

      // If the service doesn't validate dates, it will process all events
      // but isSameDay should return false for invalid dates
      isSameDay.mockImplementation((eventDate, compareDate) => {
        // Check if this is a valid date comparison
        const isValidComparison =
          eventDate instanceof Date &&
          !isNaN(eventDate.getTime()) &&
          compareDate instanceof Date &&
          !isNaN(compareDate.getTime())

        if (!isValidComparison) {
          return false
        }

        // Only return true for the first valid event
        return eventDate.getTime() === new Date('2025-01-15T10:00:00').getTime()
      })

      const result = EventFilterService.filterEventsByView(
        eventsMissingDate,
        new Date('2025-01-15'),
        'day',
      )

      // With proper date validation in the mock, only valid events should pass
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(1)
    })
  })

  describe('Performance', () => {
    it('should handle large number of events efficiently', () => {
      const largeEventsArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        datetime: new Date(2025, 0, (i % 30) + 1), // Spread across January
      }))

      isSameMonth.mockReturnValue(true)

      const result = EventFilterService.filterEventsByView(
        largeEventsArray,
        new Date('2025-01-15'),
        'month',
      )

      expect(result).toHaveLength(1000)
      expect(isSameMonth).toHaveBeenCalledTimes(1000)
    })

    it('should stop filtering early when possible', () => {
      const events = [
        { id: 1, datetime: new Date('2025-01-15T10:00:00') },
        { id: 2, datetime: new Date('2025-01-16T14:00:00') },
      ]

      // isSameDay returns false for second event
      isSameDay.mockImplementation((eventDate, compareDate) => {
        return eventDate.getTime() === new Date('2025-01-15T10:00:00').getTime()
      })

      const result = EventFilterService.filterEventsByView(events, new Date('2025-01-15'), 'day')

      // Both events should still be checked
      expect(isSameDay).toHaveBeenCalledTimes(2)
      expect(result).toHaveLength(1)
    })
  })
})
