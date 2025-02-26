<template>
  <div>
    <input v-model="vibro" class="input" placeholder="Example 30,20,30" />
    <v-btn @click="vibration" class="btnPlay"> play</v-btn>
    <v-btn @click="veryShort" class="btn" :append-icon="mdiPlay"
      >Very short
      <template v-slot:append>
        <v-icon color="warning"></v-icon>
      </template>
    </v-btn>
    <v-btn @click="short" class="btn" :append-icon="mdiPlay"
      >Short
      <template v-slot:append>
        <v-icon color="warning"></v-icon>
      </template>
    </v-btn>
    <v-btn @click="medium" class="btn" :append-icon="mdiPlay"
      >Medium
      <template v-slot:append>
        <v-icon color="warning"></v-icon>
      </template>
    </v-btn>
    <v-btn @click="long" class="btn" :append-icon="mdiPlay"
      >Long
      <template v-slot:append>
        <v-icon color="warning"></v-icon>
      </template>
    </v-btn>
    <v-btn @click="doubleVeryShort" class="btn" :append-icon="mdiPlay"
      >Double-v-Short
      <template v-slot:append>
        <v-icon color="warning"></v-icon>
      </template>
    </v-btn>
    <v-btn @click="tripleVeryShort" class="btn" :append-icon="mdiPlay"
      >Triple-v-Short
      <template v-slot:append>
        <v-icon color="warning"></v-icon>
      </template>
    </v-btn>
    <v-btn @click="doubleVeryShort" class="btn" :append-icon="mdiPlay"
      >Double-Short
      <template v-slot:append>
        <v-icon color="warning"></v-icon>
      </template>
    </v-btn>
  </div>
</template>
<script>
import { vibrate } from '@/lib/vibrate'
import { mdiPlay } from '@mdi/js'

export default {
  data: () => ({
    vibro: undefined
  }),

  setup() {
    return {
      mdiPlay
    }
  },

  methods: {
    vibration() {
      let num = this.vibro.split(',').map((i) => Number(i))
      return navigator.vibrate(num)
    },
    veryShort() {
      return vibrate.veryShort()
    },
    short() {
      return vibrate.short()
    },
    medium() {
      return vibrate.medium()
    },
    long() {
      return vibrate.long()
    },
    doubleVeryShort() {
      return vibrate.doubleVeryShort()
    },
    tripleVeryShort() {
      return vibrate.tripleVeryShort()
    },
    doubleShort() {
      return vibrate.doubleShort()
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'vuetify/settings';
@import '@/assets/styles/settings/_colors.scss';
.input {
  border: 2px solid orange;
  margin-right: 16px;
}
.btnPlay {
  background-color: rgba(205, 144, 31, 0.93);
  height: 32px;
}
.btn {
  display: flex;
  margin-top: 12px;
  background-color: map-get($adm-colors, 'regular');
}
</style>
