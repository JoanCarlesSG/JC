<template>
  <div>

    <q-input color="amber" v-model="username"
             ref="username"
             float-label="email"/>

    <q-input color="amber" v-model="password"
             ref="password"
             float-label="password"/>


    <q-btn color="grey" icon="login" label="Login" @click="login" />

  </div>
</template>

<script>
import Vue from 'vue'

import {
  QInput,
  QBtn
} from 'quasar'

export default {
  components: {
    QInput,
    QBtn
  },
  data () {
    return {
      username: '',
      password: '',
      sharedState: Vue.store.state
    }
  },
  methods: {
    login () {
      console.log('LOGIN!')
      var url = 'http://xenial.local/ajgirona/feines_proveidors/o/token/'
      const data = new FormData()
      data.append('username', this.username)
      data.append('password', this.password)
      data.append('grant_type', 'password')
      data.append('client_id', 'HrBnfIV54e82dwIeo2heqY4QvJTy0gX56yMpJ5wE')

      var self = this
      this.axios.post(url, data)
        .then(function (response) {
          console.log(response.data)
          self.sharedState.access_token = response.data.access_token
          localStorage.setItem('access_token', response.data.access_token)
          // self.$router.go(-1)
          self.$router.push('/')
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }
}
</script>

<style>
</style>
