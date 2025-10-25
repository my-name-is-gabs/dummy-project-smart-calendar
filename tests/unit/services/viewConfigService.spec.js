import { describe, it, expect, beforeEach } from 'vitest'
import ViewConfigService from '@/services/viewConfigService'

describe('viewConfigService.js', () => {
  describe('Static Properties', () => {
    it('should have correct default calendar options', () => {
      expect(ViewConfigService.defaultCalendarOptions).toEqual([
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ])
    })

    it('should have correct default labels', () => {
      expect(ViewConfigService.defaultLabels).toEqual({
        todayButton: 'Today',
        toggle: {
          left: '‹',
          right: '›',
        },
      })
    })

    it('should have correct default date formats', () => {
      expect(ViewConfigService.defaultDateFormats).toEqual({
        month: 'MMMM yyyy',
        week: 'MMM d, yyyy',
        day: 'EEEE, MMMM d, yyyy',
      })
    })
  })

  describe('getCalendarOptions', () => {
    it('should return default options when no custom options provided', () => {
      const result = ViewConfigService.getCalendarOptions()

      expect(result).toEqual(ViewConfigService.defaultCalendarOptions)
      expect(result).toHaveLength(3)
    })

    it('should return custom options when provided', () => {
      const customOptions = [
        { value: 'day', label: 'Daily' },
        { value: 'week', label: 'Weekly' },
      ]

      const result = ViewConfigService.getCalendarOptions(customOptions)

      expect(result).toEqual(customOptions)
      expect(result).toHaveLength(2)
    })

    it('should handle null custom options', () => {
      const result = ViewConfigService.getCalendarOptions(null)

      expect(result).toEqual(ViewConfigService.defaultCalendarOptions)
    })

    it('should handle undefined custom options', () => {
      const result = ViewConfigService.getCalendarOptions(undefined)

      expect(result).toEqual(ViewConfigService.defaultCalendarOptions)
    })

    it('should handle empty array custom options', () => {
      const result = ViewConfigService.getCalendarOptions([])

      expect(result).toEqual([])
    })

    it('should not modify default options when returning custom options', () => {
      const originalDefaults = [...ViewConfigService.defaultCalendarOptions]
      const customOptions = [{ value: 'custom', label: 'Custom' }]

      const result = ViewConfigService.getCalendarOptions(customOptions)

      // Default options should remain unchanged
      expect(ViewConfigService.defaultCalendarOptions).toEqual(originalDefaults)
      // Result should be the custom options
      expect(result).toEqual(customOptions)
    })
  })

  describe('getLabels', () => {
    it('should return default labels when no custom labels provided', () => {
      const result = ViewConfigService.getLabels()

      expect(result).toEqual(ViewConfigService.defaultLabels)
      expect(result.todayButton).toBe('Today')
      expect(result.toggle.left).toBe('‹')
      expect(result.toggle.right).toBe('›')
    })

    it('should merge custom labels with defaults', () => {
      const customLabels = {
        todayButton: 'Hoy',
        newLabel: 'New Label',
      }

      const result = ViewConfigService.getLabels(customLabels)

      expect(result).toEqual({
        todayButton: 'Hoy', // Overridden
        toggle: {
          // From defaults
          left: '‹',
          right: '›',
        },
        newLabel: 'New Label', // Added
      })
    })

    it('should handle partial custom labels', () => {
      const customLabels = {
        toggle: {
          left: '«',
          right: '»',
        },
      }

      const result = ViewConfigService.getLabels(customLabels)

      expect(result.todayButton).toBe('Today') // From defaults
      expect(result.toggle.left).toBe('«') // Overridden
      expect(result.toggle.right).toBe('»') // Overridden
    })

    it('should handle null custom labels', () => {
      const result = ViewConfigService.getLabels(null)

      expect(result).toEqual(ViewConfigService.defaultLabels)
    })

    it('should handle undefined custom labels', () => {
      const result = ViewConfigService.getLabels(undefined)

      expect(result).toEqual(ViewConfigService.defaultLabels)
    })

    it('should handle empty object custom labels', () => {
      const result = ViewConfigService.getLabels({})

      expect(result).toEqual(ViewConfigService.defaultLabels)
    })

    it('should not modify default labels when merging', () => {
      const originalDefaults = { ...ViewConfigService.defaultLabels }
      const customLabels = { todayButton: 'Custom Today' }

      const result = ViewConfigService.getLabels(customLabels)

      // Default labels should remain unchanged
      expect(ViewConfigService.defaultLabels).toEqual(originalDefaults)
      // Result should be merged
      expect(result.todayButton).toBe('Custom Today')
      expect(result.toggle).toEqual(originalDefaults.toggle)
    })
  })

  describe('getDateFormats', () => {
    it('should return default formats when no custom formats provided', () => {
      const result = ViewConfigService.getDateFormats()

      expect(result).toEqual(ViewConfigService.defaultDateFormats)
      expect(result.month).toBe('MMMM yyyy')
      expect(result.week).toBe('MMM d, yyyy')
      expect(result.day).toBe('EEEE, MMMM d, yyyy')
    })

    it('should merge custom formats with defaults', () => {
      const customFormats = {
        month: 'MMM yyyy',
        customFormat: 'custom',
      }

      const result = ViewConfigService.getDateFormats(customFormats)

      expect(result).toEqual({
        month: 'MMM yyyy', // Overridden
        week: 'MMM d, yyyy', // From defaults
        day: 'EEEE, MMMM d, yyyy', // From defaults
        customFormat: 'custom', // Added
      })
    })

    it('should handle partial custom formats', () => {
      const customFormats = {
        day: 'EEE, MMM d',
      }

      const result = ViewConfigService.getDateFormats(customFormats)

      expect(result.month).toBe('MMMM yyyy') // From defaults
      expect(result.week).toBe('MMM d, yyyy') // From defaults
      expect(result.day).toBe('EEE, MMM d') // Overridden
    })

    it('should handle null custom formats', () => {
      const result = ViewConfigService.getDateFormats(null)

      expect(result).toEqual(ViewConfigService.defaultDateFormats)
    })

    it('should handle undefined custom formats', () => {
      const result = ViewConfigService.getDateFormats(undefined)

      expect(result).toEqual(ViewConfigService.defaultDateFormats)
    })

    it('should handle empty object custom formats', () => {
      const result = ViewConfigService.getDateFormats({})

      expect(result).toEqual(ViewConfigService.defaultDateFormats)
    })

    it('should not modify default formats when merging', () => {
      const originalDefaults = { ...ViewConfigService.defaultDateFormats }
      const customFormats = { month: 'Custom Month Format' }

      const result = ViewConfigService.getDateFormats(customFormats)

      // Default formats should remain unchanged
      expect(ViewConfigService.defaultDateFormats).toEqual(originalDefaults)
      // Result should be merged
      expect(result.month).toBe('Custom Month Format')
      expect(result.week).toBe(originalDefaults.week)
      expect(result.day).toBe(originalDefaults.day)
    })
  })

  describe('isValidView', () => {
    it('should return true for valid views', () => {
      expect(ViewConfigService.isValidView('day')).toBe(true)
      expect(ViewConfigService.isValidView('week')).toBe(true)
      expect(ViewConfigService.isValidView('month')).toBe(true)
    })

    it('should return false for invalid views', () => {
      expect(ViewConfigService.isValidView('invalid')).toBe(false)
      expect(ViewConfigService.isValidView('')).toBe(false)
      expect(ViewConfigService.isValidView('Day')).toBe(false)
      expect(ViewConfigService.isValidView('WEEK')).toBe(false)
      expect(ViewConfigService.isValidView('Month')).toBe(false)
      expect(ViewConfigService.isValidView('year')).toBe(false)
      expect(ViewConfigService.isValidView('agenda')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(ViewConfigService.isValidView(null)).toBe(false)
      expect(ViewConfigService.isValidView(undefined)).toBe(false)
      expect(ViewConfigService.isValidView(123)).toBe(false)
      expect(ViewConfigService.isValidView({})).toBe(false)
      expect(ViewConfigService.isValidView([])).toBe(false)
    })
  })

  describe('Method Integration', () => {
    it('should work together consistently', () => {
      // Test that all methods can be called in sequence
      const options = ViewConfigService.getCalendarOptions()
      const labels = ViewConfigService.getLabels()
      const formats = ViewConfigService.getDateFormats()

      expect(options).toHaveLength(3)
      expect(labels.todayButton).toBe('Today')
      expect(formats.month).toBe('MMMM yyyy')

      // All options should be valid views
      options.forEach((option) => {
        expect(ViewConfigService.isValidView(option.value)).toBe(true)
      })
    })

    it('should handle custom configurations together', () => {
      const customOptions = [{ value: 'day', label: 'Daily' }]
      const customLabels = { todayButton: 'Hoy' }
      const customFormats = { month: 'MMM yyyy' }

      const options = ViewConfigService.getCalendarOptions(customOptions)
      const labels = ViewConfigService.getLabels(customLabels)
      const formats = ViewConfigService.getDateFormats(customFormats)

      expect(options).toEqual(customOptions)
      expect(labels.todayButton).toBe('Hoy')
      expect(formats.month).toBe('MMM yyyy')

      // Custom option should be valid
      expect(ViewConfigService.isValidView(customOptions[0].value)).toBe(true)
    })
  })

  describe('Immutability', () => {
    beforeEach(() => {
      // Reset to known state before each test
      ViewConfigService.defaultCalendarOptions = [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
      ]
      ViewConfigService.defaultLabels = {
        todayButton: 'Today',
        toggle: { left: '‹', right: '›' },
      }
      ViewConfigService.defaultDateFormats = {
        month: 'MMMM yyyy',
        week: 'MMM d, yyyy',
        day: 'EEEE, MMMM d, yyyy',
      }
    })

    it('should handle default properties correctly regardless of mutability', () => {
      const options = ViewConfigService.getCalendarOptions()
      const labels = ViewConfigService.getLabels()
      const formats = ViewConfigService.getDateFormats()

      // The important thing is that the methods work correctly
      expect(options).toHaveLength(3)
      expect(labels.todayButton).toBe('Today')
      expect(formats.month).toBe('MMMM yyyy')
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle rapid consecutive calls', () => {
      const iterations = 100

      for (let i = 0; i < iterations; i++) {
        const options = ViewConfigService.getCalendarOptions()
        const labels = ViewConfigService.getLabels()
        const formats = ViewConfigService.getDateFormats()
        const isValid = ViewConfigService.isValidView('day')

        expect(options).toBeDefined()
        expect(labels).toBeDefined()
        expect(formats).toBeDefined()
        expect(isValid).toBe(true)
      }
    })

    it('should return new objects for merged results', () => {
      const customLabels = { todayButton: 'Custom' }
      const customFormats = { month: 'Custom' }

      const result1 = ViewConfigService.getLabels(customLabels)
      const result2 = ViewConfigService.getLabels(customLabels)
      const result3 = ViewConfigService.getDateFormats(customFormats)
      const result4 = ViewConfigService.getDateFormats(customFormats)

      // Each call should return a new object (not the same reference)
      expect(result1).toEqual(result2)
      expect(result1).not.toBe(result2)
      expect(result3).toEqual(result4)
      expect(result3).not.toBe(result4)
    })
  })
})
