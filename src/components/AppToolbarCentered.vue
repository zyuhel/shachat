<template>
  <v-container :class="[classes, className]" fluid>
    <v-row justify="center" no-gutters>
      <container>
        <v-toolbar ref="toolbar" :flat="flat" :height="height">
          <v-btn v-if="showBack" icon size="small" @click="goBack">
            <v-icon :icon="mdiArrowLeft" size="x-large" />
          </v-btn>

          <v-toolbar-title v-if="title" class="a-text-regular-enlarged">
            <div>{{ title }}</div>
            <div v-if="subtitle" class="body-1">
              {{ subtitle }}
            </div>
          </v-toolbar-title>
        </v-toolbar>
      </container>
    </v-row>
  </v-container>
</template>

<script>
import { mdiArrowLeft } from '@mdi/js'

export default {
  props: {
    title: {
      type: String,
      default: undefined
    },
    subtitle: {
      type: String,
      default: undefined
    },
    flat: {
      type: Boolean,
      default: false
    },
    app: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: Boolean,
      default: false
    },
    height: {
      type: Number,
      default: 56
    },
    showBack: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    return {
      mdiArrowLeft
    }
  },
  computed: {
    classes() {
      return {
        'v-toolbar--fixed': this.app,
        'app-toolbar--fixed': this.fixed
      }
    },
    className: () => 'app-toolbar-centered'
  },
  methods: {
    goBack() {
      // there are no pages in history to go back
      if (history.length === 1) {
        this.$router.replace('/')
        return
      }

      this.$router.back()
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';

.app-toolbar-centered {
  padding: 0;

  :deep(.v-toolbar-title) {
    letter-spacing: 0.02em;
  }

  :deep(.v-toolbar-title:not(:first-child)) {
    margin-inline-start: 0;
  }

  :deep(.v-toolbar__content > .v-btn:first-child) {
    margin-inline-start: 4px;
  }

  :deep(.v-btn:hover) {
    > .v-btn__overlay {
      opacity: 0;
    }
  }
}

.app-toolbar--fixed {
  position: fixed;
  z-index: 2;
}

/** Themes **/
.v-theme--light {
  .app-toolbar-centered {
    .v-toolbar {
      background-color: map-get($adm-colors, 'secondary2');
    }
  }
}

.v-theme--dark {
  .app-toolbar-centered {
    .v-toolbar {
      background-color: map-get($adm-colors, 'black');
      color: map-get($shades, 'white');
    }
  }
}
</style>
