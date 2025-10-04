import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'

describe('TESTING APP.VUE', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(App)
  })

  it('should render SmartCalendar', () => {
    expect(wrapper.findComponent('smart-calendar-stub').exists()).toBe(true)
  })
})
