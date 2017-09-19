<template>
  <div class="layout-padding">
    <p>Are you sure you want to log out?</p>
    <q-btn @click="logout">Log out</q-btn>

  </div>
</template>

<script>
import Vue from 'vue'

import {
  QBtn
} from 'quasar'

export default {
  components: {
    QBtn
  },
  data () {
    return {
      sharedState: Vue.store.state
    }
  },
  methods: {
    logout () {
      console.log('LOGOUT!')

      var url = Vue.API_ROOT + '/ajgirona/feines_proveidors/o/revoke_token/'
      const data = new FormData()
      data.append('token', this.sharedState.access_token)
      data.append('client_id', 'HrBnfIV54e82dwIeo2heqY4QvJTy0gX56yMpJ5wE')
      this.sharedState.access_token = null
      localStorage.removeItem('access_token')

      var self = this
      this.axios.post(url, data)
        .then(function (response) {
          console.log(response.data)
          self.$router.push('/login')
        })
        .catch(function (error) {
          console.log(error)
          self.$router.push('/login')
        })
    }
  }
}
</script>

<style>
</style>
