import { shallowMount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ViewSelector from '@/components/subcomponents/calendarHeader/common/ViewSelector.vue'

describe('ViewSelector.vue', () => {
  const defaultOptions = [
    { value: 'day', label: 'Day View' },
    { value: 'week', label: 'Week View' },
    { value: 'month', label: 'Month View' },
  ]

  describe('Component Rendering and Structure', () => {
    it('should render the view selector with select element', () => {
      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: defaultOptions,
          selectedView: 'week',
        },
      })

      expect(wrapper.find('.view-selector').exists()).toBe(true)
      expect(wrapper.find('select.form-select').exists()).toBe(true)
      expect(wrapper.findAll('option')).toHaveLength(3)
    })

    it('should render all options correctly', () => {
      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: defaultOptions,
          selectedView: 'week',
        },
      })

      const options = wrapper.findAll('option')
      expect(options[0].element.value).toBe('day')
      expect(options[0].text()).toBe('Day View')
      expect(options[1].element.value).toBe('week')
      expect(options[1].text()).toBe('Week View')
      expect(options[2].element.value).toBe('month')
      expect(options[2].text()).toBe('Month View')
    })
  })

  describe('Props Handling', () => {
    it('should initialize with required props', () => {
      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: defaultOptions,
          selectedView: 'month',
        },
      })

      expect(wrapper.props().options).toEqual(defaultOptions)
      expect(wrapper.props().selectedView).toBe('month')
    })

    it('should set the select value to selectedView prop', () => {
      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: defaultOptions,
          selectedView: 'day',
        },
      })

      const select = wrapper.find('select')
      expect(select.element.value).toBe('day')
    })

    it('should update select value when selectedView prop changes', async () => {
      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: defaultOptions,
          selectedView: 'day',
        },
      })

      expect(wrapper.find('select').element.value).toBe('day')

      await wrapper.setProps({ selectedView: 'week' })
      expect(wrapper.find('select').element.value).toBe('week')
    })
  })

  describe('Event Handling', () => {
    it('should emit view-change event when selection changes', async () => {
      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: defaultOptions,
          selectedView: 'day',
        },
      })

      const select = wrapper.find('select')

      // Simulate changing selection to 'week'
      await select.setValue('week')

      expect(wrapper.emitted('view-change')).toHaveLength(1)
      expect(wrapper.emitted('view-change')[0]).toEqual(['week'])
    })

    it('should emit view-change with correct value for each option', async () => {
      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: defaultOptions,
          selectedView: 'day',
        },
      })

      const select = wrapper.find('select')

      // Test each option
      await select.setValue('week')
      expect(wrapper.emitted('view-change')[0]).toEqual(['week'])

      await select.setValue('month')
      expect(wrapper.emitted('view-change')[1]).toEqual(['month'])

      await select.setValue('day')
      expect(wrapper.emitted('view-change')[2]).toEqual(['day'])
    })

    it('should emit event with the new value when select changes', async () => {
      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: defaultOptions,
          selectedView: 'month',
        },
      })

      // Simulate the change event directly
      const select = wrapper.find('select')
      select.element.value = 'week'
      await select.trigger('change')

      expect(wrapper.emitted('view-change')).toHaveLength(1)
      expect(wrapper.emitted('view-change')[0]).toEqual(['week'])
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty options array', () => {
      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: [],
          selectedView: '',
        },
      })

      expect(wrapper.findAll('option')).toHaveLength(0)
      expect(wrapper.find('select').exists()).toBe(true)
    })

    it('should handle single option', () => {
      const singleOption = [{ value: 'day', label: 'Only Day' }]

      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: singleOption,
          selectedView: 'day',
        },
      })

      const options = wrapper.findAll('option')
      expect(options).toHaveLength(1)
      expect(options[0].element.value).toBe('day')
      expect(options[0].text()).toBe('Only Day')
    })

    it('should handle options with special characters', () => {
      const specialOptions = [
        { value: 'day-view', label: 'Day View (24h)' },
        { value: 'week_view', label: 'Week_View' },
        { value: 'month.view', label: 'Month.View' },
      ]

      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: specialOptions,
          selectedView: 'day-view',
        },
      })

      const options = wrapper.findAll('option')
      expect(options[0].element.value).toBe('day-view')
      expect(options[0].text()).toBe('Day View (24h)')
      expect(options[1].element.value).toBe('week_view')
      expect(options[2].element.value).toBe('month.view')
    })

    it('should handle options with numeric values', () => {
      const numericOptions = [
        { value: 1, label: 'First View' },
        { value: 2, label: 'Second View' },
        { value: 3, label: 'Third View' },
      ]

      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: numericOptions,
          selectedView: 2,
        },
      })

      const options = wrapper.findAll('option')
      expect(options[0].element.value).toBe('1')
      expect(options[1].element.value).toBe('2')
      expect(options[2].element.value).toBe('3')
    })

    it('should maintain selection when options change', async () => {
      const initialOptions = [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
      ]

      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: initialOptions,
          selectedView: 'week',
        },
      })

      expect(wrapper.find('select').element.value).toBe('week')

      const newOptions = [
        { value: 'day', label: 'Daily' },
        { value: 'week', label: 'Weekly' },
        { value: 'month', label: 'Monthly' },
      ]

      await wrapper.setProps({ options: newOptions, selectedView: 'month' })
      expect(wrapper.find('select').element.value).toBe('month')
      expect(wrapper.findAll('option')).toHaveLength(3)
    })

    it('should handle rapid selection changes', async () => {
      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: defaultOptions,
          selectedView: 'day',
        },
      })

      const select = wrapper.find('select')

      // Rapidly change selections
      await select.setValue('week')
      await select.setValue('month')
      await select.setValue('day')
      await select.setValue('week')

      expect(wrapper.emitted('view-change')).toHaveLength(4)
      expect(wrapper.emitted('view-change')[0]).toEqual(['week'])
      expect(wrapper.emitted('view-change')[1]).toEqual(['month'])
      expect(wrapper.emitted('view-change')[2]).toEqual(['day'])
      expect(wrapper.emitted('view-change')[3]).toEqual(['week'])
    })
  })

  describe('Accessibility and Usability', () => {
    it('should have proper form select classes', () => {
      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: defaultOptions,
          selectedView: 'week',
        },
      })

      const select = wrapper.find('select')
      expect(select.classes()).toContain('form-select')
    })

    it('should render options with correct value and text content', () => {
      const customOptions = [
        { value: 'custom1', label: 'Custom View One' },
        { value: 'custom2', label: 'Custom View Two' },
      ]

      const wrapper = shallowMount(ViewSelector, {
        props: {
          options: customOptions,
          selectedView: 'custom1',
        },
      })

      const options = wrapper.findAll('option')
      expect(options[0].attributes('value')).toBe('custom1')
      expect(options[0].text()).toBe('Custom View One')
      expect(options[1].attributes('value')).toBe('custom2')
      expect(options[1].text()).toBe('Custom View Two')
    })
  })
})
