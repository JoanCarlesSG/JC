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
import axios from 'axios'

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
      password: ''
    }
  },
  methods: {
    login () {
      console.log('LOGIN!')
      var url = 'http://xenial.local/ajgirona/feines_proveidors/o/token'
      var data = {
        username: this.username,
        password: this.password,
        grant_type: 'password'
      }
      axios.post(url, data)
        .then(function (response) {
          console.log(response.data)
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
