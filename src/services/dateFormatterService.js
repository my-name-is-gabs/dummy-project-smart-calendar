import { format, startOfWeek, endOfWeek } from 'date-fns'

/**
 * @classdesc
 * A service class that provides date formatting functionality for different calendar views.
 * This class contains static methods and does not need to be instantiated.
 */
class DateFormatterService {
  /**
   * Formats a date according to the specified calendar view and date formats
   * @param {Date} date - The date to format
   * @param {'month'|'week'|'day'} view - The calendar view type
   * @param {Object} dateFormats - Object containing format strings for different views
   * @param {string} dateFormats.month - Format string for month view
   * @param {string} dateFormats.day - Format string for day view
   * @param {number} [weekStartsOn=0] - The day the week starts on (0 = Sunday, 1 = Monday)
   * @returns {string} The formatted date string
   */
  static formatDateForView(date, view, dateFormats, weekStartsOn = 0) {
    const formatters = {
      month: () => format(date, dateFormats.month),
      week: () => this._formatWeekDate(date, weekStartsOn),
      day: () => format(date, dateFormats.day),
    }

    return formatters[view]?.() || format(date, dateFormats.month)
  }

  /**
   * Formats a week range date with intelligent formatting based on month/year boundaries
   * @param {Date} date - The date within the week to format
   * @param {number} weekStartsOn - The day the week starts on (0 = Sunday, 1 = Monday)
   * @returns {string} The formatted week range string
   * @private
   */
  static _formatWeekDate(date, weekStartsOn) {
    const weekStart = startOfWeek(date, { weekStartsOn })
    const weekEnd = endOfWeek(date, { weekStartsOn })

    if (format(weekStart, 'MMM yyyy') === format(weekEnd, 'MMM yyyy')) {
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`
    } else if (format(weekStart, 'yyyy') === format(weekEnd, 'yyyy')) {
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    } else {
      return `${format(weekStart, 'MMM d, yyyy')} - ${format(weekEnd, 'MMM d, yyyy')}`
    }
  }
}

export default DateFormatterService
