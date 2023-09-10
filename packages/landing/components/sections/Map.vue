<template>
  <section class="warriormonk__map px-20 lg:px-0">
    <div class="container flex flex-col">
      <div
        class="warriormonk__map-svg mt-28 lg:mt-0"
        v-html="require('!svg-inline-loader!~/assets/images/map.svg')"
      />

      <section class="flex flex-col flex-center w-full">
        <div class="flex flex-col text-center">
          <span class="font-mono text-64 mb-10">
            <LineAnimation :text="counterText" />
          </span>
          <span class="text-20 weight-600">Active gabl events</span>
        </div>

        <Button
          :button-class="[
            PRIMARY_BUTTON,
            'warriormonk__map-button px-56 mt-42 text-18'
          ]"
          type="a"
          href="#get-app"
          :blank="false"
          :action="scrollToHref"
        >
          Get the App
        </Button>
      </section>
    </div>
  </section>
</template>

<script>
import numeral from 'numeral'
import LineAnimation from '@synappsagency/vue-common/components/LineAnimation'
import Button from '@synappsagency/vue-common/components/Button'

import { APP_URL, PRIMARY_BUTTON } from '~/assets/js/config'
import { scrollToHref } from '~/assets/js/helpers'

export default {
  components: {
    Button,
    LineAnimation
  },
  data() {
    return {
      PRIMARY_BUTTON,
      APP_URL,
      counter: 48021
    }
  },
  computed: {
    counterText() {
      return numeral(this.counter).format('0,0')
    }
  },
  mounted() {
    this.counterInterval = setInterval(this.count.bind(this), 3000)
  },
  methods: {
    scrollToHref,
    count() {
      const number = Math.round(Math.random() * 90)
      this.counter = this.counter + (Math.random() ? -number : number)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@synappsagency/vue-common/scss/mixins';

$markers: 8;
$animationLength: 2s;
$animationDelay: $animationLength / 2;

@keyframes marker {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@for $i from 1 through $markers {
  .warriormonk__map-svg /deep/ g#marker-desktop-#{$i} {
    animation: marker $animationLength alternate-reverse ease-in-out;
    animation-iteration-count: infinite;
    animation-fill-mode: both;
    animation-delay: $animationDelay * $i;
  }

  .warriormonk__map-svg /deep/ g#marker-mobile-#{$i} {
    animation: marker $animationLength alternate-reverse ease-in-out;
    animation-iteration-count: infinite;
    animation-fill-mode: both;
    animation-delay: $animationDelay * $i;
  }
}
.warriormonk__map {
  overflow: hidden;
}

.warriormonk__map-button {
  height: 64px;
  border-radius: 32px;
}

.font-mono /deep/ span.synapps__char-diff-char {
  position: relative;
  top: -0.15em;
}

@include breakpoint-min('lg') {
  .warriormonk__map-svg /deep/ g[id^='marker-mobile'] {
    display: none;
  }

  .warriormonk__map {
    padding: 84px 0px 172px;
  }
}

@include breakpoint-max('lg') {
  .warriormonk__map-svg /deep/ g[id^='marker-desktop'] {
    display: none;
  }

  .warriormonk__map-svg {
    width: 280vw;
  }

  .warriormonk__map {
    padding: 72px 0px 128px;
  }

  .warriormonk__map .container {
    align-items: center;
  }
}
</style>
