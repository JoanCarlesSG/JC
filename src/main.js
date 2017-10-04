// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
// require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
require(`quasar/dist/quasar.${__THEME}.css`)
// ==============================

// Uncomment the following lines if you need IE11/Edge support
// require(`quasar/dist/quasar.ie`)
// require(`quasar/dist/quasar.ie.${__THEME}.css`)

import Vue from 'vue'

// Vue.API_ROOT = 'http://xenial.local'
Vue.API_ROOT = 'https://server3.microdisseny.com'

import moment from 'moment'
import VueMomentJS from 'vue-momentjs'
Vue.use(VueMomentJS, moment)

var VueScrollTo = require('vue-scrollto')
Vue.use(VueScrollTo)

import Quasar from 'quasar'
import router from './router'
Vue.router = router

import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

import lodash from 'lodash'
import VueLodash from 'vue-lodash'
Vue.use(VueLodash, lodash)

Vue.config.productionTip = false
Vue.use(Quasar) // Install Quasar Framework

if (__THEME === 'mat') {
  require('quasar-extras/roboto-font')
}
import 'quasar-extras/material-icons'
// import 'quasar-extras/ionicons'
// import 'quasar-extras/fontawesome'
// import 'quasar-extras/animate'
import 'quasar-extras/animate/fadeIn.css'
import 'quasar-extras/animate/fadeOut.css'

import Lawnchair from 'lawnchair'

var store = {
  state: {
    access_token: '',
    jobs: {},
    queue: {
      running: false,
      jobs: [],
      photos: []
    }
  },
  localStore: new Lawnchair(),

  stateSave: function () {
    this.localStore.save({key: 'access_token', data: this.state.access_token})
  },
  stateLoad: function () {
    let self = this
    this.localStore.get('access_token', function (accessToken) {
      if (accessToken) {
        self.state.access_token = accessToken.data
      }
    })
  },
  jobsSave: function () {
    this.localStore.save({key: 'jobs', data: this.state.jobs})
  },
  queueSave: function () {
    this.localStore.save({key: 'queue', data: this.state.queue})
  },
  queueSetRunning: function () {
    this.state.queue.running = true
  },
  queueJobsEmpty: function () {
    return this.state.queue.jobs.length === 0
  },
  queueJobsFirst: function () {
    return this.state.queue.jobs[0]
  },
  queueAddJob: function (job) {
    this.state.queue.jobs.push(job)
    this.queueSave()
  },
  queueAddFoto: function (photo) {
    this.state.queue.photos.push(photo)
    this.queueSave()
  }
}
Vue.store = store
window.store = store

Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#q-app',
    router,
    render: h => h(require('./App'))
  })
})
