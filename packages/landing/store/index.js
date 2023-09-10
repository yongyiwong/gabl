import _ from 'lodash'

const BREAKPOINTS = {
  xs: '375px',
  sm: '576px',
  md: '768px',
  lg: '991px',
  xl: '1200px',
  '2xl': '1440px',
  '3xl': '1920px'
}

const MOBILE_VIEWS = ['xs', 'sm', 'md', 'lg']

export function getView(width) {
  let view = '3xl'

  _.each(Object.keys(BREAKPOINTS).reverse(), (key) => {
    if (width <= parseInt(BREAKPOINTS[key], 10)) {
      view = key
    }
  })

  return view
}

/**
 * returns true if mobile view needs to be rendered here and now
 *
 * @returns {boolean}
 */
export function isMobile(view, mobileViews = []) {
  const checkViews = mobileViews.length > 0 ? mobileViews : MOBILE_VIEWS
  return checkViews.includes(view)
}

export const state = () => ({
  startAnimation: true,
  heroAnimationCompleted: false,
  scrolled: false,
  view: null
})

export const getters = {
  mobile(state) {
    return isMobile(state.view, MOBILE_VIEWS)
  }
}

export const mutations = {
  startAnimation(state, value) {
    state.startAnimation = value
  },
  resize(state) {
    if (process.browser) {
      state.view = getView(window.outerWidth)
    }
  },
  scrolled(state) {
    state.scrolled = true
  },
  heroAnimationCompleted(state) {
    state.heroAnimationCompleted = true
  }
}
