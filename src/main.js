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
Vue.APP_VERSION = '0.8.0'

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

import _ from 'lodash'
import VueLodash from 'vue-lodash'
Vue.use(VueLodash, _)

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

import photoUtil from './photoUtil.js'

var store = {
  state: {
    errors: [],
    startup: {
      jobs: {}
    },
    username: '',
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
    elementTasks: [],

    photoCache: {}
  },
  localStore: new Lawnchair(),

  stateSave: function () {
    console.log('stateSave', this.state.username, this.state.startup)
    this.localStore.save({key: 'access_token', data: this.state.access_token})
    this.localStore.save({key: 'username', data: this.state.username})
    this.localStore.save({key: 'startup', data: this.state.startup})
  },
  stateLoad: function () {
    let self = this
    this.localStore.get('startup', function (startup) {
      console.log('startup cache', startup)
      if (startup.data) {
        self.state.startup = startup.data
        self.startupLoadReferenceData(startup.data)
      }
    })

    this.localStore.get('queue', function (queue) {
      console.log('saved queue', queue)
      if (queue) {
        queue.data.jobs.forEach(queuedJob => {
          let job = self.state.jobs[queuedJob.id]
          self.state.queue.jobs.push(job)
        })
        queue.data.photos.forEach(photo => {
          let cachedPhoto = self.state.photoCache[photo.id]
          if (cachedPhoto) {
            self.state.queue.photos.push(cachedPhoto)
          }
          else {
            console.error('photo not found when loading queue')
            console.error(photo)
          }
        })
      }
    })

    this.localStore.get('access_token', function (accessToken) {
      if (accessToken) {
        self.state.access_token = accessToken.data
      }
    })
    this.localStore.get('username', function (username) {
      if (username) {
        self.state.username = username.data
      }
    })

    // load jobs from local cache
    this.localStore.get('jobs', function (jobs) {
      console.log('saved jobs', jobs)
      if (jobs) {
        Vue._.forEach(jobs.data, function (job) {
          if (!job) {
            return
          }
          job._is_remote = false
          console.log('Adding job ' + job.id + ' (stateLoad)')
          // self.state.jobs[job.id] = job
          Vue.set(self.state.jobs, job.id, job)
          job.photos.forEach(photo => {
            photoUtil.getBlob(photo, function (blob) {
              photo.src = URL.createObjectURL(blob)
            })
            self.state.photoCache[photo.id] = photo
          })
          if (!job.updated_on) {
            job.updated_on = 0
          }
        })
      }
    })
  },
  startupLoadReferenceData: function (startup) {
    Vue.set(this.state, 'username', startup.username)
    this.state.contracts = startup.contracts
    this.state.elementTypes = startup.element_types
    this.state.elementGroups = startup.element_groups
    this.state.elementTasks = startup.element_tasks
  },
  startupProcess: function (startup) {
    let self = this
    startup.jobs.forEach(remoteJob => {
      let jobId = remoteJob.id
      // get latest version of job
      let job = self.state.jobs[jobId]
      console.log('jod id ' + jobId, job)

      // check if the job has been loaded before
      let startupJob
      if (self.state.startup.jobs) {
        startupJob = self.state.startup.jobs[jobId]
      }

      let queuedJob = self.queueGetJob(jobId) || false

      if (startupJob && queuedJob) {
        // compare new and orig
        let equal = Vue._.isEqual(remoteJob, startupJob)
        console.log('equals: ', equal)
        if (!equal) {
          // get changed fields
          let remoteChanges = _.reduce(remoteJob, function (result, value, key) {
            return _.isEqual(value, startupJob[key]) ? result : result.concat(key)
          }, [])
          console.log('remoteChanges', remoteChanges)
          // console.log('moment(remoteJob.updated_on) > moment(job.updated_on)', moment(remoteJob.updated_on).toISOString(), '>', moment(job.updated_on).toISOString())
          // compare updated_on
          if (moment(remoteJob.updated_on).valueOf() > moment(job.updated_on).valueOf()) {
            // apply changes remoteJob => job
            console.log('apply changes remoteJob => job')
            remoteChanges.forEach(change => {
              // FIXME: normalize fields
              if (change === 'element_type') {
                job['elementType'] = remoteJob[change]
              }
              else if (change === 'element_group') {
                job['location'] = remoteJob[change]
              }
              else if (change === 'element_task') {
                job['task'] = remoteJob[change]
              }
              else {
                job[change] = remoteJob[change]
              }
            })
          }
          else {
            // apply changes only if field has not been updated on job
            console.log('apply changes only if field has not been updated on job')
            let localChanges = _.reduce(job, function (result, value, key) {
              return _.isEqual(value, startupJob[key]) ? result : result.concat(key)
            }, [])
            console.log('localChanges', localChanges)
            remoteChanges.forEach(change => {
              if (_.includes(localChanges, change)) {
                // change collides with local change, don't apply
                console.log("skip change because local is newer for '" + change + "'")
                return
              }
              console.log('Apply change to ' + change)

              // FIXME: normalize fields
              if (change === 'element_type') {
                job['elementType'] = remoteJob[change]
              }
              else if (change === 'element_group') {
                job['location'] = remoteJob[change]
              }
              else if (change === 'element_task') {
                job['task'] = remoteJob[change]
              }
              else {
                job[change] = remoteJob[change]
              }
            })
          }

          // set as new startup data
          self.state.startup.jobs[jobId] = remoteJob
        }

        if (job) {
          job._is_remote = true
        }
      }
      else {
        // replace local object with remote object
        console.log('No pending changes, use remote data')
        Vue.delete(this.state.jobs, jobId)
        job = undefined
      }

      if (!job) {
        console.log('Adding job ' + jobId)
        // add
        job = {
          id: remoteJob.id,
          photos: []
        }

        job._is_remote = true

        job.contract = remoteJob.contract
        job.elementType = remoteJob.element_type
        job.location = remoteJob.element_group
        job.task = remoteJob.element_task
        job.quantity = remoteJob.quantity
        job.note = remoteJob.note
        Vue.set(job, 'status', remoteJob.status)
        job.created_on = remoteJob.created_on
        if (remoteJob.updated_on > job.updated_on) {
          Vue.set(job, 'updated_on', remoteJob.updated_on)
        }

        remoteJob.photos.forEach(remotePhoto => {
          let photo = self.state.photoCache[remotePhoto.id]
          let isNew = false
          if (!photo) {
            photo = {
              id: remotePhoto.id,
              job_id: remotePhoto.job
            }
            isNew = true
          }
          photo.src = remotePhoto.photo
          photo.description = remotePhoto.description
          photo.taken_on = remotePhoto.taken_on
          photo.type = remotePhoto.photo_type

          if (isNew) {
            job.photos.push(photo)
          }
        })

        this.jobsAdd(job)
        // set as new startup data
        self.state.startup.jobs[jobId] = remoteJob
      }
    })

    // check if jobs are still valid on the server
    Vue._.forEach(this.state.jobs, function (job) {
      // check if job is in queue
      let queuedJob = self.queueGetJob(job.id) || false

      console.log('check local jobs', 'job id', job.id, 'remote', job._is_remote, 'queuedJob', queuedJob)
      if (!job._is_remote && job.id > 0 && !queuedJob) {
        // the job has been deleted on the server
        console.log('remove job')
        Vue.store.jobsRemove(job.id)
        Vue.store.queueRemoveJob(job.id)
      }
      else {
        job._is_remote = false
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
  queueGetJob: function (jobId) {
    return Vue._.find(this.state.queue.jobs, function (job) {
      return job.id === jobId
    })
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
  queueDeletePhoto: function (photo) {
    // check if the photo is already in the queue for upload
    this.queueRemovePhoto(photo.id)
    this.queueAddPhoto(photo)
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
