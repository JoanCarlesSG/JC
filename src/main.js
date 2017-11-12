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
import 'moment/locale/ca'
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
import 'quasar-extras/animate/slideInDown.css'
import 'quasar-extras/animate/slideOutUp.css'

import Lawnchair from 'lawnchair'

var store = {
  state: {
    errors: [],
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
    console.info('Saving jobs...')
    this.localStore.save({key: 'jobs', data: this.state.jobs})
  },
  jobsAdd: function (job) {
    Vue.set(this.state.jobs, job.id, job)
    this.jobsSave()
  },
  jobsMove: function (job, newId) {
    console.log('Jobs: move job from ' + job.id + ' to ' + newId)
    Vue.delete(this.state.jobs, job.id)
    Vue.set(job, 'id', newId)
    Vue.set(this.state.jobs, job.id, job)
    this.jobsSave()
  },
  jobsRemove: function (jobId) {
    console.log('Jobs: remove jobId ' + jobId)
    Vue.delete(this.state.jobs, jobId)
    this.jobsSave()
  },
  queueSave: function () {
    console.info('Saving queue...')
    this.localStore.save({key: 'queue', data: this.state.queue})
  },
  queueSetRunning: function (running) {
    this.state.queue.running = running
    this.state.version += 1
  },
  queueIsEmpty: function () {
    return this.queueJobsEmpty() && this.queuePhotosEmpty()
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
  queueRemoveJob: function (jobId) {
    console.log('remove jobId ' + jobId)
    console.log(this.state.queue.jobs)
    Vue._.remove(this.state.queue.jobs, function (n) {
      return n.id === jobId
    })
    this.queueSave()
  },
  queuePhotosEmpty: function () {
    return this.state.queue.photos.length === 0
  },
  queueAddPhoto: function (photo) {
    this.state.queue.photos.push(photo)
    this.queueSave()
  },
  queueRemovePhoto: function (photoId) {
    Vue._.remove(this.state.queue.photos, function (n) {
      return n.id === photoId
    })
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
