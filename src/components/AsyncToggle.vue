<template>
  <q-btn
    small
    icon="alarm"
    color="micro"
    :disabled="loading"
    @click="onClick"
  >
    <span v-if="typeof value === 'boolean'" v-html="options[value]"></span>
    <q-icon v-else-if="!loading" name="refresh" />
    <q-spinner style="margin: 0 0.8em" v-if="loading" />
  </q-btn>
</template>

<script>
import {
  QIcon,
  QBtn,
  QSpinner
} from 'quasar'

export default {
  components: {
    QIcon,
    QBtn,
    QSpinner
  },
  props: {
    options: {
      type: Object,
      required: true
    },
    getValue: {
      type: Function,
      required: true
    },
    setValue: {
      type: Function,
      required: true
    }
  },
  data () {
    return {
      loading: true,
      error: null,
      value: null
    }
  },
  created () {
    this.loadValue()
  },
  methods: {
    onClick () {
      if (this.value === null) {
        // Refresh
        this.loadValue()
      }
      else {
        // Set value
        this.toggleState()
      }
    },
    loadValue () {
      this.getValue()
        .then(v => {
          this.value = !!v
        })
        .catch(e => {
          this.value = null
          this.error = e
        })
        .finally(_ => { this.loading = false })
    },
    toggleState () {
      const oldValue = this.value
      this.value = !oldValue

      // Try to sync
      this.loading = true
      this.setValue(this.value)
        .then(v => {
          this.value = !!v
        })
        .catch(e => {
          this.error = e
          this.value = oldValue
        })
        .finally(_ => {
          this.loading = false
        })
    }
  }
}
</script>
