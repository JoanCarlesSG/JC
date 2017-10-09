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

    <div v-if="!loading">
      <div class="layout-view">
        <sync />
        <div class="layout-padding logout-form">
          <p>Esteu segurs que voleu tancar la sessió?</p>
          <q-btn color="micro" @click="logout">Tancar sessió</q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

import {
  QBtn,
  QIcon,
  Dialog,
  QTransition
} from 'quasar'

import Sync from './Sync.vue'

export default {
  components: {
    QBtn,
    QIcon,
    Sync,
    QTransition
  },
  data () {
    return {
      loading: false,
      sharedState: Vue.store.state
    }
  },
  methods: {
    logout () {
      let self = this
      console.log('LOGOUT!')
      if (Vue.store.queueIsEmpty()) {
        this.realLogout()
      }
      else {
        Dialog.create({
          title: 'Atenció!',
          message: 'Es perdran dades si tanqueu la sessió sense sincronitzar les dades, voleu realment tancar la sessió?',
          buttons: [
            'No',
            {
              label: 'Sí, tancar sessió',
              handler () {
                self.realLogout()
              }
            }
          ]
        })
      }
    },
    realLogout () {
      console.log('REAL logout!')
      this.loading = true

      var url = Vue.API_ROOT + '/ajgirona/feines_proveidors/o/revoke_token/'
      const data = new FormData()
      data.append('token', this.sharedState.access_token)
      data.append('client_id', 'HrBnfIV54e82dwIeo2heqY4QvJTy0gX56yMpJ5wE')
      this.sharedState.access_token = null
      this.sharedState = {
        access_token: '',
        jobs: {},
        queue: {
          running: false,
          jobs: [],
          photos: []
        },
        version: 0,
        contracts: [],
        elementTypes: [],
        elementGroups: [],
        elementTasks: []
      }

      Vue.store.localStore.nuke()

      var self = this
      this.axios.post(url, data)
        .then(function (response) {
          console.log(response.data)
          self.loading = false
          self.$router.replace('/login')
        })
        .catch(function (error) {
          console.log(error)
          self.loading = false
          self.$router.replace('/login')
        })
    }
  }
}
</script>

<style>
.logout-form {
  padding: 60px 50px
}
</style>
