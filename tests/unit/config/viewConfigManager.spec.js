import { describe, it, expect } from 'vitest'
import ViewConfigManager from '@/config/viewConfigManager'

describe('viewConfigManager.js', () => {
  describe('Static Methods', () => {
    describe('getComponentName', () => {
      it('should return correct component name for valid views', () => {
        expect(ViewConfigManager.getComponentName('day')).toBe('DayCalendar')
        expect(ViewConfigManager.getComponentName('week')).toBe('WeekCalendar')
        expect(ViewConfigManager.getComponentName('month')).toBe('MonthCalendar')
      })

      it('should return default component name for invalid views', () => {
        expect(ViewConfigManager.getComponentName('invalid')).toBe('MonthCalendar')
        expect(ViewConfigManager.getComponentName('')).toBe('MonthCalendar')
        expect(ViewConfigManager.getComponentName(null)).toBe('MonthCalendar')
        expect(ViewConfigManager.getComponentName(undefined)).toBe('MonthCalendar')
      })

      it('should handle case sensitivity', () => {
        // Views are case-sensitive as per the configuration keys
        expect(ViewConfigManager.getComponentName('Day')).toBe('MonthCalendar')
        expect(ViewConfigManager.getComponentName('WEEK')).toBe('MonthCalendar')
        expect(ViewConfigManager.getComponentName('Month')).toBe('MonthCalendar')
      })
    })

    describe('getComponentProps', () => {
      it('should return correct props for valid views', () => {
        expect(ViewConfigManager.getComponentProps('day')).toEqual({ showTimeSlots: true })
        expect(ViewConfigManager.getComponentProps('week')).toEqual({ showWeekEnds: true })
        expect(ViewConfigManager.getComponentProps('month')).toEqual({ maxVisibleEvents: 3 })
      })

      it('should merge with base props when provided', () => {
        const baseProps = { customProp: 'value', weekStartsOn: 0 }

        const dayProps = ViewConfigManager.getComponentProps('day', baseProps)
        expect(dayProps).toEqual({
          customProp: 'value',
          weekStartsOn: 0,
          showTimeSlots: true,
        })

        const weekProps = ViewConfigManager.getComponentProps('week', baseProps)
        expect(weekProps).toEqual({
          customProp: 'value',
          weekStartsOn: 0,
          showWeekEnds: true,
        })

        const monthProps = ViewConfigManager.getComponentProps('month', baseProps)
        expect(monthProps).toEqual({
          customProp: 'value',
          weekStartsOn: 0,
          maxVisibleEvents: 3,
        })
      })

      it('should handle empty base props', () => {
        const props = ViewConfigManager.getComponentProps('day', {})
        expect(props).toEqual({ showTimeSlots: true })
      })

      it('should return empty object for invalid views', () => {
        expect(ViewConfigManager.getComponentProps('invalid')).toEqual({})
        expect(ViewConfigManager.getComponentProps('')).toEqual({})
        expect(ViewConfigManager.getComponentProps(null)).toEqual({})
        expect(ViewConfigManager.getComponentProps(undefined)).toEqual({})
      })

      it('should merge base props even for invalid views', () => {
        const baseProps = { customProp: 'value' }
        const props = ViewConfigManager.getComponentProps('invalid', baseProps)
        expect(props).toEqual({ customProp: 'value' })
      })

      it('should override base props with view-specific props', () => {
        const baseProps = { maxVisibleEvents: 5, showTimeSlots: false }

        const monthProps = ViewConfigManager.getComponentProps('month', baseProps)
        expect(monthProps).toEqual({
          maxVisibleEvents: 3, // View-specific prop overrides base prop
          showTimeSlots: false, // Base prop remains
        })
      })
    })

    describe('isViewValid', () => {
      it('should return true for valid views', () => {
        expect(ViewConfigManager.isViewValid('day')).toBe(true)
        expect(ViewConfigManager.isViewValid('week')).toBe(true)
        expect(ViewConfigManager.isViewValid('month')).toBe(true)
      })

      it('should return false for invalid views', () => {
        expect(ViewConfigManager.isViewValid('invalid')).toBe(false)
        expect(ViewConfigManager.isViewValid('')).toBe(false)
        expect(ViewConfigManager.isViewValid('Day')).toBe(false)
        expect(ViewConfigManager.isViewValid('WEEK')).toBe(false)
        expect(ViewConfigManager.isViewValid('Month')).toBe(false)
        expect(ViewConfigManager.isViewValid('year')).toBe(false)
        expect(ViewConfigManager.isViewValid('agenda')).toBe(false)
      })

      it('should handle edge cases', () => {
        expect(ViewConfigManager.isViewValid(null)).toBe(false)
        expect(ViewConfigManager.isViewValid(undefined)).toBe(false)
        expect(ViewConfigManager.isViewValid(123)).toBe(false)
        expect(ViewConfigManager.isViewValid({})).toBe(false)
        expect(ViewConfigManager.isViewValid([])).toBe(false)
      })
    })
  })

  describe('Configuration Integrity', () => {
    it('should have consistent configuration for all views', () => {
      // This test ensures that all configured views have both component and props
      const views = ['day', 'week', 'month']

      views.forEach((view) => {
        const componentName = ViewConfigManager.getComponentName(view)
        const componentProps = ViewConfigManager.getComponentProps(view)

        expect(componentName).toBeDefined()
        expect(componentName).not.toBe('')
        expect(typeof componentName).toBe('string')

        expect(componentProps).toBeDefined()
        expect(typeof componentProps).toBe('object')
      })
    })

    it('should have unique component names for each view', () => {
      const componentNames = [
        ViewConfigManager.getComponentName('day'),
        ViewConfigManager.getComponentName('week'),
        ViewConfigManager.getComponentName('month'),
      ]

      // All component names should be unique
      const uniqueNames = new Set(componentNames)
      expect(uniqueNames.size).toBe(componentNames.length)
    })
  })

  describe('Method Interactions', () => {
    it('should work together consistently', () => {
      const testCases = [
        { view: 'day', isValid: true, expectedComponent: 'DayCalendar', shouldHaveProps: true },
        { view: 'week', isValid: true, expectedComponent: 'WeekCalendar', shouldHaveProps: true },
        { view: 'month', isValid: true, expectedComponent: 'MonthCalendar', shouldHaveProps: true },
        {
          view: 'invalid',
          isValid: false,
          expectedComponent: 'MonthCalendar',
          shouldHaveProps: false,
        },
      ]

      testCases.forEach(({ view, isValid, expectedComponent, shouldHaveProps }) => {
        const actualIsValid = ViewConfigManager.isViewValid(view)
        const componentName = ViewConfigManager.getComponentName(view)
        const componentProps = ViewConfigManager.getComponentProps(view)

        expect(actualIsValid).toBe(isValid)
        expect(componentName).toBe(expectedComponent)

        if (shouldHaveProps) {
          expect(Object.keys(componentProps).length).toBeGreaterThan(0)
        } else {
          expect(componentProps).toEqual({})
        }
      })
    })

    it('should handle sequential method calls', () => {
      // Test that methods can be called in sequence without side effects
      expect(ViewConfigManager.isViewValid('day')).toBe(true)
      expect(ViewConfigManager.getComponentName('day')).toBe('DayCalendar')
      expect(ViewConfigManager.getComponentProps('day')).toEqual({ showTimeSlots: true })

      // Call them again to ensure no state changes
      expect(ViewConfigManager.isViewValid('day')).toBe(true)
      expect(ViewConfigManager.getComponentName('day')).toBe('DayCalendar')
      expect(ViewConfigManager.getComponentProps('day')).toEqual({ showTimeSlots: true })
    })
  })

  describe('Performance and Reliability', () => {
    it('should handle rapid consecutive calls', () => {
      const iterations = 100

      for (let i = 0; i < iterations; i++) {
        expect(ViewConfigManager.isViewValid('week')).toBe(true)
        expect(ViewConfigManager.getComponentName('week')).toBe('WeekCalendar')
        expect(ViewConfigManager.getComponentProps('week')).toEqual({ showWeekEnds: true })
      }
    })

    it('should not modify original configuration', () => {
      const originalDayProps = ViewConfigManager.getComponentProps('day')
      const originalWeekProps = ViewConfigManager.getComponentProps('week')
      const originalMonthProps = ViewConfigManager.getComponentProps('month')

      // Call methods multiple times
      ViewConfigManager.getComponentProps('day', { custom: 'prop' })
      ViewConfigManager.getComponentProps('week', { another: 'prop' })
      ViewConfigManager.getComponentProps('month', { different: 'prop' })

      // Original configurations should remain unchanged
      expect(ViewConfigManager.getComponentProps('day')).toEqual(originalDayProps)
      expect(ViewConfigManager.getComponentProps('week')).toEqual(originalWeekProps)
      expect(ViewConfigManager.getComponentProps('month')).toEqual(originalMonthProps)
    })
  })
})
