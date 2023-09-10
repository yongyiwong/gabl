// eslint-disable-next-line no-unused-vars
const keywords = [
  'ux design software',
  'mobile ui design',
  'mobile ux design',
  'ux ui design agency',
  'ui desginer',
  'ui ux development company',
  'ux designer and developer',
  'ux designer and front end developer',
  'website development agency',
  'web development company',
  'website development company',
  'full stack development services',
  'front end development company',
  'full stack development company',
  'custom software development for startups',
  'website development agency',
  'custom software development agency',
  'ux design software',
  'ux design company',
  'ux agency',
  'ui ux design company',
  'app design agency',
  'digital agencies'
]

const testBaseURL = '/warriormonk'
const themeColor = '#101010'
const DESCRIPTION =
  'Creating Connection in our Communities one download at a time!'

module.exports = {
  mode: 'spa',
  router: {
    base: process.env.NODE_ENV === 'test' ? testBaseURL : ''
  },
  env: {
    BASE_URL: process.env.NODE_ENV === 'test' ? testBaseURL : ''
  },
  /*
   ** Headers of the page
   */
  head: {
    title: 'Give. Ask. Borrow. Love.',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: DESCRIPTION
      },
      // {
      //   name: 'keywords',
      //   content: keywords.join(', ')
      // },
      {
        name: 'apple-mobile-web-app-title',
        content: 'GABL'
      },
      {
        name: 'application-name',
        content: 'GABL'
      },
      {
        name: 'theme-color',
        content: themeColor
      },
      {
        name: 'msapplication-TileColor',
        content: themeColor
      }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png'
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png'
      },
      {
        rel: 'stylesheet',
        href: '/fonts/poppins/stylesheet.css'
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Sriracha&display=swap'
      },
      {
        rel: 'stylesheet',
        href: '/fonts/dealerplate/stylesheet.css'
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png'
      },
      { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#FCCD34' }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: themeColor },
  /*
   ** Global CSS
   */
  css: ['@/assets/scss/base.scss'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    [
      '@nuxtjs/google-analytics',
      {
        id: 'UA-158281450-2'
      }
    ]
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    [
      '@nuxtjs/google-gtag',
      {
        id: 'UA-158281450-2',
        debug: true
      }
    ],
    [
      'nuxt-social-meta',
      {
        url: 'https://gabl.global',
        description: DESCRIPTION,
        img: '/OG.png',
        locale: 'en_US'
        // twitter: '@synapps.agency'
      }
    ]
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  },
  pwa: {
    manifest: {
      name: 'Give. Ask. Borrow. Love.',
      short_name: 'GABL',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      theme_color: themeColor,
      background_color: themeColor,
      display: 'standalone'
    }
  }
}
