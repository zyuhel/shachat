<template>
  <div>
    <v-btn :icon="mdiChevronLeft" :disabled="page <= 1" variant="text" @click="page--" />
    <v-btn :icon="mdiChevronRight" :disabled="page >= pages" variant="text" @click="page++" />
  </div>
</template>

<script>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

export default {
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    pages: {
      type: Number,
      required: true
    }
  },
  setup() {
    return {
      mdiChevronLeft,
      mdiChevronRight
    }
  },
  emits: ['update:modelValue'],
  computed: {
    page: {
      get() {
        return this.modelValue
      },
      set(value) {
        if (value > this.pages || value < 1) {
          return
        }

        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>
