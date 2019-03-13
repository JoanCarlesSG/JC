<template>
  <img :src="authenticatedSrc" />
</template>

<script>
import Vue from 'vue'

export default {
  props: ['src'],
  data () {
    return {
      sharedState: Vue.store.state
    }
  },
  computed: {
    authenticatedSrc () {
      if (this.src) {
        if (this.src.startsWith('http')) {
          return this.src + '?access_token=' + this.sharedState.access_token
        }
        else {
          return this.src
        }
      }
      return ''
    }
  }
}
</script>

<style>
</style>
