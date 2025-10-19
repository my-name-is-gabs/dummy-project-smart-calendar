import { isSameDay, isSameWeek, isSameMonth } from 'date-fns'

/**
 * @classdesc
 * A service class that provides filtering functionality for events based on different time views.
 * This class contains static methods and does not need to be instantiated.
 */
class EventFilterService {
  /**
   * Filters an array of events based on the specified calendar view and current date.
   *
   * @param {Array<Object>} events - The array of event objects to filter
   * @param {Date} currentDate - The reference date used for filtering comparisons
   * @param {string} view - The calendar view type ('day', 'week', or 'month')
   * @param {number} [weekStartsOn=0] - Optional: The day the week starts on (0 = Sunday, 1 = Monday, etc.)
   * @returns {Array<Object>} A new array containing only the events that match the specified view criteria
   *
   * @example
   * // Filter events for a specific day
   * const dailyEvents = EventFilterService.filterEventsByView(
   *   events,
   *   new Date('2025-01-15'),
   *   'day'
   * )
   *
   * @example
   * // Filter events for a week starting on Monday
   * const weeklyEvents = EventFilterService.filterEventsByView(
   *   events,
   *   new Date('2025-01-15'),
   *   'week',
   *   1
   * )
   *
   * @throws {Error} If events is not an array
   * @throws {Error} If currentDate is not a valid Date object
   */
  static filterEventsByView(events, currentDate, view, weekStartsOn = 0) {
    return events.filter((event) => {
      const eventDate = new Date(event.datetime)

      switch (view) {
        case 'day':
          return isSameDay(eventDate, currentDate)
        case 'week':
          return isSameWeek(eventDate, currentDate, { weekStartsOn: weekStartsOn })
        case 'month':
          return isSameMonth(eventDate, currentDate)
        default:
          return true
      }
    })
  }
}

export default EventFilterService
