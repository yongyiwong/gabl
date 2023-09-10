<template>
  <Intersect @enter="visible = true" @leave="visible = false">
    <section class="warriormonk__hero px-20 lg:px-0">
      <div class="container flex">
        <!-- Right -->
        <section class="warriormonk__hero-left flex flex-col">
          <h1>
            Give. Ask.<br />
            Borrow. <span class="text-primary">Love</span>
            <span class="heart-dot" />
          </h1>

          <p
            class="my-18 lg:my-32 text-subtext text-14 lg:text-18 weight-500"
            style="line-height: 1.5em"
          >
            Welcome to your local community with a sense of sustainability.<br />
            Connect, talk and do good deeds locally to spread the love globally.
          </p>

          <section class="warriormonk__hero-buttons my-18 lg:my-24 flex">
            <Button
              v-for="button in APP_BUTTONS"
              :key="button.name"
              type="a"
              :href="button.href"
              button-class="warriormonk__store-button bg-text mr-10 xs:mr-24"
            >
              <img :src="button.image" :alt="button.name" />
            </Button>
          </section>

          <section
            class="warriormonk__good-deeds flex flex-center mt-28 lg:mt-16"
          >
            <span class="font-mono weight-500 flex flex-center text-64">
              <LineAnimation :text="counterText" />
            </span>

            <span
              class="text-subtext weight-700 uppercase text-14 lg:text-16 mt-8 lg:mt-0 lg:ml-16"
            >
              Good Deeds<br />
              Completed
            </span>
          </section>
        </section>

        <section class="warriormonk__hero-right flex flex-center">
          <div class="warriormonk__iphone" :class="{ visible }"></div>
        </section>

        <section class="warriormonk__hero-bg" />
      </div>
    </section>
  </Intersect>
</template>

<script>
import Intersect from 'vue-intersect'
import numeral from 'numeral'
import Button from '@synappsagency/vue-common/components/Button'
import LineAnimation from '@synappsagency/vue-common/components/LineAnimation'

import { APP_BUTTONS, NUMERAL_LOCALE } from '~/assets/js/config'

numeral.register('locale', 'warmonk', NUMERAL_LOCALE)
numeral.locale('warmonk')

export default {
  components: {
    Intersect,
    LineAnimation,
    Button
  },
  data() {
    return {
      APP_BUTTONS,
      visible: false,
      counter: 1032041
    }
  },
  computed: {
    mobile() {
      return this.$store.getters.mobile
    },
    counterText() {
      return numeral(this.counter).format('0,0')
    }
  },
  mounted() {
    this.counterInterval = setInterval(this.count.bind(this), 1000)
  },
  methods: {
    count() {
      this.counter = this.counter + Math.round(Math.random() * 150)
    }
  }
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/_variables';
@import '@synappsagency/vue-common/scss/mixins';

.warriormonk__hero {
  display: flex;
  flex-direction: column;

  justify-content: center;
  align-items: center;

  overflow: hidden;
}

.warriormonk__hero .container {
  position: relative;
  flex-direction: column;
  justify-content: center;
}

h1 {
  font-size: 54px;
  line-height: 60px;
  font-weight: 700;
}

h1 .font-sriracha {
  font-weight: 400;
  font-size: 32px;
}

h1 .heart-dot {
  font-size: 10px;
  left: -6px;
  top: -1px;
}

.warriormonk__hero-left,
.warriormonk__hero-right {
  position: relative;
  z-index: 10;
}

.warriormonk__hero-right {
  flex-grow: 1;
  height: 75vh;
}

.warriormonk__iphone,
.warriormonk__hero-bg {
  background-repeat: no-repeat;
}

.warriormonk__iphone {
  width: 100%;
  height: 100%;

  max-width: 368px;
  max-height: 736px;

  background-image: url('~assets/images/iphone.png');
  background-size: auto 100%;
  background-position: center;

  transition: all 1.5s ease;
  transition-property: opacity, transform;

  opacity: 0;
  transform: translateY(25px);
}

.warriormonk__iphone.visible {
  opacity: 1;
  transform: translateY(0px);
}

.warriormonk__hero-bg {
  position: absolute;
  z-index: 0;

  width: 880px;
  height: 880px;

  top: -50px;
  left: 50%;
  margin-left: -440px;

  background-image: url('~assets/images/map-bg.png');
  background-size: 100%;
}

.warriormonk__store-button {
  width: 146px;
  height: 48px;

  background: #000;
  border: 1px solid rgba(#fff, 0.2);
  box-sizing: border-box;
  border-radius: 10px;

  &:hover {
    background: #333;
  }
}

.warriormonk__good-deeds
  > span:first-child
  /deep/
  span.synapps__char-diff-char {
  position: relative;
  top: -0.15em;
}

.warriormonk__good-deeds > span:last-child {
  line-height: 1.5em;
}

@include breakpoint-min('lg') {
  .warriormonk__hero {
    height: 100vh;
    padding-top: 90px;
  }

  .warriormonk__hero .container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  h1 {
    line-height: 60px;
    font-size: 54px;
  }

  .warriormonk__hero-bg {
    top: 50%;
    right: -100px;

    margin-top: -440px;
  }

  .warriormonk__hero-left {
    width: 50%;
    align-items: flex-start;
    margin-left: 28px;
  }

  .warriormonk__hero-right {
    flex-grow: 1;
    height: 75vh;
  }
}

@media (min-width: 1260px) {
  .warriormonk__hero-left {
    margin-left: 0px;
  }
}

@include breakpoint-max('lg') {
  .warriormonk__hero {
    padding-top: 70px;
  }

  h1 {
    margin-top: 1.75em;
    text-align: center;
    letter-spacing: -1px;
  }

  h1,
  h1 + .text-subtext {
    text-align: center;
  }

  .warriormonk__hero-buttons {
    justify-content: center;

    a:last-child {
      margin: 0px;
    }
  }

  .warriormonk__hero-right {
    margin-top: 36px;
    width: 100%;

    @include aspect-ratio(368px, 736px);

    .warriormonk__iphone {
      position: absolute;

      top: 0px;
      left: 0px;

      max-width: 100%;

      background-position: center;
    }
  }

  .warriormonk__good-deeds {
    flex-direction: column;

    br {
      display: none;
    }
  }
}
</style>
