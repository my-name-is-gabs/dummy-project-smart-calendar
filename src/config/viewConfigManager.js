class ViewConfigManager {
  static #viewConfigs = {
    day: {
      component: 'DayCalendar',
      props: { showTimeSlots: true },
    },
    week: {
      component: 'WeekCalendar',
      props: { showWeekEnds: true },
    },
    month: {
      component: 'MonthCalendar',
      props: { maxVisibleEvents: 3 },
    },
  }

  static getComponentName(view) {
    return this.#viewConfigs[view]?.component || 'MonthCalendar'
  }

  static getComponentProps(view, baseComponent = {}) {
    const viewProps = this.#viewConfigs[view]?.props || {}
    return { ...baseComponent, ...viewProps }
  }

  static isViewValid(view) {
    return Object.keys(this.#viewConfigs).includes(view)
  }
}

export default ViewConfigManager
