<template>
  <section class="warriormonk__features px-20 lg:px-0">
    <div class="container flex flex-col">
      <Intersect
        v-for="(item, index) in FEATURES"
        :key="item.title"
        @enter="featureVisible(index)"
        root-margin="60% 0px 0px 0px"
      >
        <section
          class="warriormonk__feature flex"
          :class="{ visible: visibleFeatures.includes(index) }"
        >
          <section class="warriormonk__feature-picture">
            <div
              class="warriormonk__feature-picture-bg"
              :style="pictureStyle(item)"
            ></div>
          </section>
          <section class="warriormonk__feature-body flex flex-col">
            <div
              class="warriormonk__feature-index bg-primary text-white text-24 lg:text-32 flex flex-center weight-700"
            >
              <div
                class="gabl__logo-icon"
                :class="[`gabl__logo-icon_${item.icon}`]"
              />
            </div>
            <h3 class="mt-24 mb-16 lg:my-24 text-primary weight-700">
              {{ item.title }}
            </h3>
            <p
              class="m-0 text-subtext weight-500 text-14 lg:text-20 line-20 lg:line-28"
            >
              {{ item.body }}
            </p>
          </section>
        </section>
      </Intersect>
    </div>
  </section>
</template>

<script>
import _ from 'lodash'
import Intersect from 'vue-intersect'

import { FEATURES } from '~/assets/js/config'

export default {
  components: {
    Intersect
  },
  data() {
    return {
      FEATURES,
      visibleFeatures: []
    }
  },
  methods: {
    pictureStyle(item) {
      return {
        backgroundImage: `url(${item.picture})`,
        paddingTop: `${(item.pictureAspectH / item.pictureAspectW) * 100}%`
      }
    },
    featureVisible(index) {
      this.visibleFeatures = _.union(this.visibleFeatures, [index])
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@synappsagency/vue-common/scss/mixins';

.warriormonk__features .container {
  max-width: 1440px - (180px * 2);
}

.warriormonk__features h3 {
  font-size: 28px;
}

.warriormonk__feature {
  flex-direction: column-reverse;

  justify-content: center;
  align-items: stretch;

  transition: all 1.5s ease;
  transition-property: opacity, transform;

  opacity: 0;
  transform: translateY(25px);
}

.warriormonk__feature.visible {
  opacity: 1;
  transform: translateY(0px);
}

.warriormonk__feature-picture-bg {
  width: 100%;

  background-size: contain;
  background-repeat: no-repeat;
}

.warriormonk__feature-index {
  width: 46px;
  height: 46px;

  border-radius: 23px;
}

@include breakpoint-min('lg') {
  .warriormonk__features h3 {
    font-size: 38px;
  }

  .warriormonk__feature {
    margin-bottom: 82px;

    flex-direction: row;

    justify-content: space-between;
    align-items: center;
  }

  .warriormonk__feature-body {
    margin-left: 100px;
  }

  .warriormonk__feature-body .text-subtext {
    width: 80%;
  }

  .warriormonk__feature-body,
  .warriormonk__feature-picture {
    width: 50%;
  }

  .warriormonk__feature:nth-child(2n) {
    flex-direction: row-reverse;

    .warriormonk__feature-body {
      margin-right: 100px;
      margin-left: 0px;
    }
  }

  .warriormonk__feature-index {
    width: 64px;
    height: 64px;

    border-radius: 32px;
  }
}

$icons: ('G', 'A', 'B', 'L');

.gabl__logo-icon {
  width: 100%;
  height: 100%;

  background-size: 50% 50%;
  background-repeat: no-repeat;
  background-position: center;
}

@each $icon in $icons {
  .gabl__logo-icon_#{ $icon } {
    background-image: url('~assets/images/#{$icon}.svg');
  }
}

@include breakpoint-max('lg') {
  .warriormonk__feature:first-child {
    margin-top: 68px;
  }

  .warriormonk__feature {
    margin-top: 92px;
  }

  .warriormonk__feature-body {
    align-items: center;
    text-align: center;

    margin-bottom: 32px;
  }
}
</style>
