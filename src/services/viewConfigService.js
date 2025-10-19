/**
 * @classdesc
 * A service class that provides configuration management for calendar views, labels, and date formats.
 * This class contains static methods and properties and does not need to be instantiated.
 */
class ViewConfigService {
  /**
   * Default calendar view options
   * @type {Array<{value: string, label: string}>}
   */
  static defaultCalendarOptions = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ]

  /**
   * Default UI labels and text content
   * @type {Object}
   */
  static defaultLabels = {
    todayButton: 'Today',
    toggle: {
      left: '‹',
      right: '›',
    },
  }

  /**
   * Default date format patterns for different views
   * @type {Object}
   */
  static defaultDateFormats = {
    month: 'MMMM yyyy',
    week: 'MMM d, yyyy',
    day: 'EEEE, MMMM d, yyyy',
  }

  /**
   * Gets calendar view options, with fallback to defaults if no custom options provided
   * @param {Array<{value: string, label: string}>} [customOptions] - Custom calendar options
   * @returns {Array<{value: string, label: string}>} Calendar options array
   */
  static getCalendarOptions(customOptions = null) {
    return customOptions || this.defaultCalendarOptions
  }

  /**
   * Gets UI labels, merging custom labels with defaults
   * @param {Object} [customLabels] - Custom labels to merge with defaults
   * @returns {Object} Merged labels object
   */
  static getLabels(customLabels = null) {
    return customLabels ? { ...this.defaultLabels, ...customLabels } : this.defaultLabels
  }

  /**
   * Gets date formats, merging custom formats with defaults
   * @param {Object} [customFormats] - Custom date formats to merge with defaults
   * @returns {Object} Merged date formats object
   */
  static getDateFormats(customFormats = null) {
    return customFormats
      ? { ...this.defaultDateFormats, ...customFormats }
      : this.defaultDateFormats
  }

  /**
   * Validates if a view type is supported
   * @param {string} view - The view type to validate
   * @returns {boolean} True if the view is valid
   */
  static isValidView(view) {
    return ['day', 'week', 'month'].includes(view)
  }
}

export default ViewConfigService
