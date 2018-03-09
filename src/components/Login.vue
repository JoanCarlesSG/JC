<template>
  <div>
    <q-transition
      enter="fadeIn"
      leave="fadeOut"
    >
      <div class="loading" v-if="loading">
        <div><q-icon name="sync" class="animate-spin-reverse" /></div>
        <div>Un moment si us plau</div>
      </div>
    </q-transition>

    <div v-if="!loading" class="layout-padding login-form">
      <q-alert
        v-for="error in errors"
        :key="error"
        type="negative"
        ref="destroyableAlert"
        enter="bounceInRight"
        leave="bounceOutLeft"
      >
        {{ error }}
      </q-alert>

      <q-input v-model="username"
               ref="username"
               float-label="email"
               type="email"
               @enter="login"
               />

      <q-input v-model="password"
               ref="password"
               float-label="password"
               type="password"
               @enter="login"
               />

      <q-btn id="login-button" color="micro" @click="login">Log in</q-btn>
    </div>

  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'

import {
  QInput,
  QBtn,
  QAlert,
  QIcon,
  QTransition
} from 'quasar'

export default {
  components: {
    QInput,
    QBtn,
    QAlert,
    QIcon,
    QTransition
  },
  data () {
    return {
      username: '',
      password: '',
      sharedState: Vue.store.state,
      loading: false,
      errors: []
    }
  },
  methods: {
    login () {
      this.loading = true
      this.errors = []
      console.log('LOGIN!')
      var url = Vue.API_ROOT + '/o/token/'
      const data = new FormData()
      data.append('username', this.username)
      data.append('password', this.password)
      data.append('grant_type', 'password')
      data.append('client_id', 'HrBnfIV54e82dwIeo2heqY4QvJTy0gX56yMpJ5wE')
      data.append('_version', Vue.APP_VERSION)
      data.append('_username', this.sharedState.username)

      var self = this
      axios.post(url, data, { timeout: 5000 })
        .then(function (response) {
          console.log(response.data)
          self.sharedState.access_token = response.data.access_token
          Vue.store.stateSave()
          // self.$router.go(-1)
          self.loading = false
          console.log('replace("/"')
          self.$router.replace('/')
          // send refresh signal, it will force getting startup data
          self.$emit('refresh')
        })
        .catch(function (error) {
          console.log(error)
          self.loading = false

          // If there was a problem, we need to
          // dispatch the error condition
          if (error.response.status >= 400 && error.response.status <= 600) {
            self.errors.push('Login error, please try again')
          }
          else {
            self.errors.push('Please check your network connection and try again.')
          }
        })
    }
  }
}
</script>

<style>
.login-form {
  padding: 60px 50px
}
</style>
