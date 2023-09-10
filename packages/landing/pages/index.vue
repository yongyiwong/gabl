<template>
  <main class="warriormonk bg-white">
    <Header class-name="bg-white lg:bg-white-90">
      <template v-slot:left>
        <a href="/" class="logo flex">
          <img src="~/assets/images/Logo.svg" alt="GABL" />

          <span class="flex flex-col h-full">
            <span
              class="text-12 line-18 lg:text-14 lg:line-20 weight-700 text-text"
            >
              Give. Ask. Borrow. <span class="text-primary">Love</span>
              <span class="heart-dot" />
            </span>
            <span
              class="text-12 line-18 text-light-gray lg:text-14 lg:line-20 weight-500"
            >
              #EverythingIsShared
            </span>
          </span>
        </a>
      </template>
      <template v-slot:right>
        <Button
          :button-class="[PRIMARY_BUTTON, 'primary-button text-12 lg:text-14']"
          text="Get the App"
          type="a"
          href="#get-app"
          :blank="false"
          :action="scrollToHref"
        />
      </template>
    </Header>

    <component
      :is="mobile ? 'section' : 'vue-perfect-scrollbar'"
      class="index__container"
    >
      <Hero />
      <Features />
      <Map />
      <App />

      <Footer footer-class="bg-white" container-class="flex">
        <span class="text-12 lg:text-14 mt-12 lg:mt-0">
          {{ COPYRIGHT_TEXT }}
        </span>

        <span class="footer__links flex flex-center w-full h-full">
          <a
            v-for="link in FOOTER_LINKS"
            :key="link.text"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            class="text-14 text-text hover:text-text-hover mx-16 my-12 lg:ml-32 lg:mr-0 lg:my-0"
          >
            {{ link.text }}
          </a>
        </span>

        <a
          href="https://synapps.agency/"
          target="_blank"
          rel="noopener noreferrer"
          class="synapps__developed-by flex text-synapps-grey"
        >
          <span class="text-8 mr-12">Developed by</span>
          <img src="~/assets/images/synapps-grey.svg" alt="" />
        </a>
      </Footer>
    </component>
  </main>
</template>

<script>
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import Header from '@synappsagency/vue-common/components/Header'
import Footer from '@synappsagency/vue-common/components/Footer'
import Button from '@synappsagency/vue-common/components/Button'

import Hero from '~/components/sections/Hero.vue'
import Features from '~/components/sections/Features.vue'
import Map from '~/components/sections/Map.vue'
import App from '~/components/sections/App.vue'

import { scrollToHref } from '~/assets/js/helpers'

import {
  APP_URL,
  PRIMARY_BUTTON,
  COPYRIGHT_TEXT,
  FOOTER_LINKS
} from '~/assets/js/config'

export default {
  components: {
    Header,
    Hero,
    Features,
    Map,
    App,
    VuePerfectScrollbar,
    Footer,
    Button
  },
  data() {
    return {
      APP_URL,
      PRIMARY_BUTTON,
      COPYRIGHT_TEXT,
      FOOTER_LINKS
    }
  },
  computed: {
    mobile() {
      return this.$store.getters.mobile
    }
  },
  mounted() {
    if (process.browser) {
      window.addEventListener('resize', this.resize)
      this.resize()
    }
  },
  methods: {
    scrollToHref,
    resize() {
      this.$store.commit('resize')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@synappsagency/vue-common/scss/mixins';

main {
  min-height: 100vh;
}

footer /deep/ .container {
  flex-direction: column-reverse;
  justify-content: center;
  align-items: center;

  position: relative;
}

.footer__links {
  position: absolute;
  top: 0px;
  left: 0px;

  pointer-events: none;
}

.footer__links * {
  pointer-events: auto;
}

.header .logo img {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  margin-right: 10px;
}

.header .logo {
  height: 42px;
}

.header .logo > .flex {
  justify-content: center;
}

.header .logo:hover {
  opacity: 0.75;
}

.header .logo .heart-dot {
  font-size: 3px;
  left: -2px;
}

.header .primary-button {
  height: 36px;
  border-radius: 18px;
  padding: 0px 28px;
}

.index__container {
  width: 100%;
}

.synapps__developed-by {
  align-items: center;

  &:hover {
    opacity: 0.7;
  }
}

@include breakpoint-min('lg') {
  .index__container {
    height: 100vh;
    overflow: hidden;
  }

  header,
  footer {
    height: 90px !important;
  }

  footer {
    padding: 0px;
  }

  footer /deep/ .container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .header .logo {
    height: 64px;
  }

  .header .logo img {
    width: 64px;
    height: 64px;

    flex-shrink: 0;

    margin-right: 20px;
  }

  .header .primary-button {
    height: 42px;
    border-radius: 21px;
    padding: 0px 38px;
  }
}

@include breakpoint-max('lg') {
  footer {
    height: auto;
    padding: 32px 0px;
  }

  .footer__links {
    position: relative;
    height: auto !important;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    order: 3;
  }

  footer /deep/ span.text-12 {
    order: 2;
  }

  header {
    background: #fff;
  }

  .synapps__developed-by {
    margin-top: 24px;
    order: 1;
  }
}
</style>
