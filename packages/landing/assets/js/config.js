import moment from 'moment'

export const PRIMARY_BUTTON =
  'bg-primary hover:bg-primary-hover border-primary hover:border-primary-hover text-white weight-600'

export const APP_URL = '/'
export const PRIVACY_LINK = 'https://www.iubenda.com/privacy-policy/10852009'
export const COOKIE_POLICY_LINK =
  'https://www.iubenda.com/privacy-policy/10852009/cookie-policy'
export const TOS_LINK = 'https://www.iubenda.com/terms-and-conditions/10852009'
export const CONTACT_EMAIL = 'connect@thewarriormonk.com'

export const COPYRIGHT_TEXT = `© ${moment().format('YYYY')} gabl`

export const FOOTER_LINKS = [
  {
    text: 'Terms of service',
    href: TOS_LINK
  },
  {
    text: 'Privacy policy',
    href: PRIVACY_LINK
  },
  {
    text: 'Contact Us',
    href: `mailto:${CONTACT_EMAIL}`
  }
]

export const APP_BUTTONS = [
  {
    name: 'App Store',
    href: 'https://apps.apple.com/app/id1504509029',
    image: process.env.BASE_URL + '/images/app-store.svg'
  },
  {
    name: 'Google Play',
    href: 'https://play.google.com/store/apps/details?id=com.warriormonk.app',
    image: process.env.BASE_URL + '/images/google-play.svg'
  }
]

export const FEATURES = [
  {
    title: 'Give or share',
    icon: 'G',
    body:
      'things and/or services by listing on your community feed using the give feature. Find things or services you could use as well.',
    picture: process.env.BASE_URL + '/images/feature-1.png',
    pictureAspectW: 503,
    pictureAspectH: 476
  },
  {
    title: 'Ask',
    icon: 'A',
    body:
      'for help from your community. There are plenty of people who want to help you and could use your help as well!',
    picture: process.env.BASE_URL + '/images/feature-2.png',
    pictureAspectW: 442,
    pictureAspectH: 511
  },
  {
    title: 'Borrow',
    icon: 'B',
    body:
      'from others using the community chats feature or create gabs aka gabbing 😊 to discuss what you’re looking for.',
    picture: process.env.BASE_URL + '/images/feature-3.png',
    pictureAspectW: 531,
    pictureAspectH: 410
  },
  {
    title: 'Love',
    icon: 'L',
    body:
      'and help change the world. Each time you help you are earning karma points. We are going to have prizes for the most active members soon',
    picture: process.env.BASE_URL + '/images/feature-4.png',
    pictureAspectW: 465,
    pictureAspectH: 386
  }
]

export const NUMERAL_LOCALE = {
  delimiters: {
    thousands: ` `
  }
}
