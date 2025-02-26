<template>
  <tr :class="classes.root">
    <td colspan="3">
      <v-alert :class="classes.alert" color="rgba(0, 0, 0, 0.54)" :icon="mdiAlert">
        Your search for "{{ searchQuery }}" found no results.
      </v-alert>
    </td>
  </tr>
</template>

<script>
import { defineComponent } from 'vue'
import { mdiAlert } from '@mdi/js'

export default defineComponent({
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  setup() {
    const className = 'delegates-not-found'
    const classes = {
      root: className,
      alert: `${className}__alert`
    }

    return {
      classes,
      mdiAlert
    }
  }
})
</script>

<style lang="scss">
.delegates-not-found {
  &__alert {
    margin-top: 4px;
    margin-bottom: 4px;
  }
}
</style>
