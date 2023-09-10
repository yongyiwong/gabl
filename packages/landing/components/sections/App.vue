<template>
  <Intersect @enter="visible = true" @leave="visible = false">
    <section id="get-app" class="warriormonk__app px-20 lg:px-0">
      <div class="container flex flex-col flex-center">
        <div class="warriormonk__app-icon" />
        <h2 class="text-32 weight-700 text-center">
          Let’s start changing the world
          <span class="font-sriracha text-red weight-400" :class="{ visible }">
            <span>today</span>
          </span>
        </h2>

        <section class="warriormonk__hero-buttons my-18 lg:my-0 flex">
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
      </div>

      <div class="warriormonk__app-bg bg-primary">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
      </div>
    </section>
  </Intersect>
</template>

<script>
import Intersect from 'vue-intersect'
import Button from '@synappsagency/vue-common/components/Button'

import { APP_BUTTONS } from '~/assets/js/config'

export default {
  components: {
    Intersect,
    Button
  },
  data() {
    return {
      APP_BUTTONS,
      visible: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/_variables';
@import '@synappsagency/vue-common/scss/mixins';

$cd: 1400px;
$cdmin: 100px;

@keyframes circle {
  0% {
    opacity: 0;
    transform: scale($cdmin / $cd);
  }
  25% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}

.warriormonk__app {
  position: relative;
  overflow: hidden;
  height: 544px;
}

.warriormonk__app .container {
  height: 100%;
  position: relative;
  z-index: 10;
}

.warriormonk__app-bg {
  position: absolute;
  z-index: 0;

  top: 0px;
  left: 0px;

  width: 100%;
  height: 100%;
}

.warriormonk__app-icon {
  width: 82px;
  height: 82px;

  background: url('~assets/images/Logo.svg');
  background-size: 100%;
  background-position: 0px 0px;
  background-repeat: no-repeat;
}

h2 {
  line-height: 46px;
  margin: 64px auto;
}

.circle {
  position: absolute;
  opacity: 0;

  bottom: -($cd / 2) - 100px;
  left: 50%;

  margin-left: -($cd / 2);

  width: $cd;
  height: $cd;
  border-radius: $cd / 2;

  background: rgba(255, 255, 255, 0.12);
  border: 6px solid rgba(255, 255, 255, 0.2);

  animation: circle 20s infinite forwards linear;
  transform-origin: center;
}

.font-sriracha {
  @include text-stroke(1px, lighten(map-get($colors, 'primary'), 1%));
}

.warriormonk__hero-buttons {
  justify-content: center;

  a:last-child {
    margin: 0px;
  }
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

@for $i from 1 through 7 {
  .circle:nth-child(#{ $i }) {
    animation-delay: 4s * $i;
  }
}

@include breakpoint-min('lg') {
  .warriormonk__app {
    height: 640px;
  }

  .font-sriracha {
    @include text-stroke(2px, lighten(map-get($colors, 'primary'), 1%));
  }

  h2 {
    width: 50%;
    font-size: 54px;
    line-height: 81px;
    margin: 36px auto 42px;
  }

  .warriormonk__app-icon {
    width: 110px;
    height: 110px;
  }
}

@include breakpoint-max('lg') {
}
</style>
