<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <q-layout
      ref="layout"
      view="lHh Lpr fff"
      :left-class="{'bg-grey-2': true}"
    >
      <q-toolbar slot="header" class="">
        <q-toolbar-title @click="$router.push('/')">
          Feines proveïdors
          <div slot="subtitle">Ajuntament de Girona</div>
        </q-toolbar-title>

        <q-btn
          flat
          @click="$refs.layout.toggleRight()"
        >
          <q-icon name="menu" />
        </q-btn>
      </q-toolbar>

      <div slot="right">
        <!--
          Use <q-side-link> component
          instead of <q-item> for
          internal vue-router navigation
        -->

        <q-list no-border link inset-delimiter>
          <q-list-header>{{ sharedState.username }}</q-list-header>
          <q-item @click="logout">
            <q-item-side icon="exit_to_app" />
            <q-item-main label="Tancar sessió" />
          </q-item>
          <!--
          <q-item to="/report">
            <q-item-side icon="bug_report" />
            <q-item-main label="Comunicar incidència" />
          </q-item>
          <q-item to="/help">
            <q-item-side icon="help" />
            <q-item-main label="Ajuda" />
          </q-item>
          -->
        </q-list>

        <p style="text-align: center; margin-top: 30px; font-size: 0.8em" class="text-grey-7">
          Versió 0.5.1
        </p>

        <p style="text-align: center; margin-top: 30px; font-size: 0.8em" class="text-grey-7">
          Powered by <a target="_blank" href="http://www.microdisseny.com">Microdisseny</a>
        </p>
      </div>

      <!--
        Replace following <div> with
        <router-view /> component
        if using subRoutes
      -->
      <q-transition
        enter="fadeIn"
        leave="fadeOut"
      >
        <div class="loading" v-if="loading">
          <div><q-icon name="sync" class="animate-spin-reverse" /></div>
          <div>Un moment si us plau</div>
        </div>
      </q-transition>

      <keep-alive>
        <router-view v-if="!loading" class="layout-view"></router-view>
      </keep-alive>

    </q-layout>
  </div>
</template>

<script>
/*
 * Root component
 */

import Vue from 'vue'

import {
  QLayout,
  QToolbar,
  QToolbarTitle,
  QBtn,
  QIcon,
  QList,
  QListHeader,
  QItem,
  QItemSide,
  QItemMain,
  QTransition,
  QSlideTransition

} from 'quasar'

import photoUtil from './photoUtil.js'

export default {
  components: {
    QLayout,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    QList,
    QListHeader,
    QItem,
    QItemSide,
    QItemMain,
    QTransition,
    QSlideTransition
  },
  data: function () {
    return {
      loading: false,
      startup: null,
      errors: [],
      sharedState: Vue.store.state
    }
  },
  created: function () {
    try {
      Vue.store.stateLoad()
      this.sharedState.queueCheckId = setInterval(this.queueCheck, 10000)
    }
    catch (e) {
      console.log(e)
    }
  },
  watch: {
    // call again the method if the route changes
    '$route': 'routeChanged'
  },
  methods: {
    logout () {
      console.log('woooop')
      this.$router.push('/logout')
      this.$refs.layout.hideCurrentSide()
    },
    routeChanged () {
      let self = this
      console.log(this.$route.path)

      // if (this.$route.path === '/') {
      //   debugger
      // }

      if (this.$route.path === '/login') {
        // make sure dialog will appear
        this.loading = false
        return
      }

      if (this.$route.path === '/logout') {
        console.log('CLOSE')
        // make sure dialog will appear
        this.loading = false
      }

      console.log('Auth ok?')
      if (!this.sharedState.access_token) {
        this.loading = false
        this.$router.push('/login')
        console.log('Needs login')
        return
      }

      console.log('Fetch data?')
      if (this.startup == null) {
        console.log('Fetching data...')
        this.loading = true

        var config = {
          headers: {'Authorization': 'Bearer '.concat(this.sharedState.access_token)},
          timeout: 10000
        }

        // Fetches posts when the component is created.
        this.axios.get(Vue.API_ROOT + '/ajgirona/feines_proveidors/startup', config)
          .then(response => {
            console.log('startup response ok')
            // JSON responses are automatically parsed.
            self.loadStartupData(response.data, true)

            console.log(self.startup)
            // Save startup cache
            Vue.store.localStore.save({key: 'startup', data: self.startup})
            console.log('startup cache saved')
            self.loading = false
          })
          .catch(e => {
            console.log(e)
            if (e.request.status === 403) {
              self.loading = false
              self.$router.push('/login')
            }
            else {
              console.log('startup response ERROR')
              self.errors.push(e)
              console.log(self.errors)
              self.loading = false
              Vue.store.localStore.get('startup', function (me) {
                console.log('startup cache')
                self.loadStartupData(me.data)
                self.loading = false
              })
            }
          })
      }
    },
    loadStartupData (startup, newJobs) {
      console.log('startup data: ', startup)
      this.startup = startup
      this.sharedState.username = startup.username
      this.sharedState.contracts = startup.contracts
      this.sharedState.elementTypes = startup.element_types
      this.sharedState.elementGroups = startup.element_groups
      this.sharedState.elementTasks = startup.element_tasks
      console.log('Startup data loaded')

      var photoCache = {}

      let self = this
      Vue.store.localStore.get('jobs', function (jobs) {
        console.log('saved jobs')
        console.log(jobs)
        if (jobs) {
          Vue._.forEach(jobs.data, function (job) {
            job._is_remote = false
            console.log('Adding job ' + job.id)
            self.sharedState.jobs[job.id] = job
            job.photos.forEach(photo => {
              photoUtil.getBlob(photo, function (blob) {
                photo.src = URL.createObjectURL(blob)
              })
              photoCache[photo.id] = photo
            })
            if (!job.updated_on) {
              job.updated_on = 0
            }
          })
        }
      })

      if (newJobs) {
        startup.jobs.forEach(remoteJob => {
          let job = self.sharedState.jobs[remoteJob.id]

          if (!job) {
            job = {
              id: remoteJob.id,
              photos: []
            }
          }

          job._is_remote = true

          job.contract = remoteJob.contract
          job.elementType = remoteJob.element_type
          job.location = remoteJob.element_group
          job.task = remoteJob.element_task
          job.quantity = remoteJob.quantity
          job.note = remoteJob.note
          job.status = remoteJob.status
          job.created_on = remoteJob.created_on
          if (remoteJob.updated_on > job.updated_on) {
            job.updated_on = remoteJob.updated_on
          }

          console.log('remotejob photos: ' + remoteJob.photos.length)

          remoteJob.photos.forEach(remotePhoto => {
            let photo = photoCache[remotePhoto.id]
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

          Vue.set(self.sharedState.jobs, job.id, job)
        })

        // check if jobs are still valid on the server
        Vue._.forEach(this.sharedState.jobs, function (job) {
          if (!job._is_remote && job.id > 0) {
            // the job has been deleted on the server
            Vue.store.jobsRemove(job.id)
            Vue.store.queueRemoveJob(job.id)
          }
        })
      }

      Vue.store.localStore.get('queue', function (queue) {
        console.log('saved queue')
        console.log(queue)
        if (queue) {
          queue.data.jobs.forEach(queuedJob => {
            let job = self.sharedState.jobs[queuedJob.id]
            self.sharedState.queue.jobs.push(job)
          })
          queue.data.photos.forEach(photo => {
            let cachedPhoto = photoCache[photo.id]
            if (cachedPhoto) {
              self.sharedState.queue.photos.push(cachedPhoto)
            }
            else {
              console.error('photo not found when loading queue')
              console.error(photo)
            }
          })
        }
      })
    },
    queueCheck () {
      console.log('Queue CHECK! -> running? ' + this.sharedState.queue.running)

      if (this.sharedState.queue.running) {
        console.debug('Queue already running')
        return
      }

      if (!Vue.store.queueJobsEmpty()) {
        Vue.store.queueSetRunning(true)
        let job = Vue.store.queueJobsFirst()
        this.uploadJob(job)
        return
      }

      if (this.sharedState.queue.photos.length > 0) {
        Vue.store.queueSetRunning(true)
        console.log('Queue started')
        let photo = this.sharedState.queue.photos[0]
        this.uploadPhoto(photo)
      }
    },
    uploadJob (job) {
      let self = this
      console.log('Uploading job ... ' + job.id)
      Vue.set(this.sharedState.queue, 'uploading', job)

      var config = {
        headers: {'Authorization': 'Bearer '.concat(this.sharedState.access_token)},
        timeout: 60000
      }

      const data = new FormData()
      if (job.contract) {
        data.append('contract', job.contract)
      }
      if (job.elementType) {
        data.append('element_type', job.elementType)
      }
      if (job.location) {
        data.append('element_group', job.location)
      }
      if (job.task) {
        data.append('element_task', job.task)
      }
      data.append('quantity', job.quantity || '')
      if (job.note) {
        data.append('note', job.note)
      }
      data.append('status', job.status)
      if (job.created_on) {
        data.append('created_on', this.$moment(job.created_on).toISOString())
      }
      if (job.updated_on) {
        data.append('updated_on', this.$moment(job.updated_on).toISOString())
      }

      if (job.id > 0) {
        // Existing job, update
        let url = Vue.API_ROOT + '/ajgirona/feines_proveidors/api/v1/jobs/' + job.id + '/'

        this.axios.put(url, data, config)
          .then(function (response) {
            console.debug('Response:', response)

            Vue.store.queueRemoveJob(job.id)
            Vue.store.queueSetRunning(false)
            self.queueCheck()
          })
          .catch(function (error) {
            console.error(error)
            Vue.store.queueSetRunning(false)
          })
      }
      else {
        // New job, add
        let url = Vue.API_ROOT + '/ajgirona/feines_proveidors/api/v1/jobs/'

        this.axios.post(url, data, config)
          .then(function (response) {
            console.debug('Response:', response)

            Vue.store.jobsMove(job, response.data.id)
            Vue.store.queueRemoveJob(job.id)
            job.photos.forEach(photo => {
              console.log(photo, 'new job_id', job.id)
              photo.job_id = job.id
            })
            Vue.store.queueSetRunning(false)
          })
          .catch(function (error) {
            console.error(error)
            Vue.store.queueSetRunning(false)
          })
      }
    },
    uploadPhoto (photo) {
      let self = this
      console.log('Uploading photo ... ' + photo.id)
      Vue.set(this.sharedState.queue, 'uploading', photo)
      console.log(photo)

      var config = {
        headers: {'Authorization': 'Bearer '.concat(this.sharedState.access_token)},
        timeout: 60000
      }

      var url = Vue.API_ROOT + '/ajgirona/feines_proveidors/api/v1/jobphotos/'
      const data = new FormData()
      data.append('job', photo.job_id)
      data.append('description', photo.description)
      data.append('taken_on', self.$moment(photo.taken_on).toISOString())
      data.append('photo_type', photo.type)
      console.log(photo)

      if (photo.id > 0) {
        // Existing job
        if (photo._delete) {
          console.log('DELETE PHOTO')
          console.log(photo)
          Vue.store.queueRemovePhoto(photo.id)
          Vue.store.queueSetRunning(false)
          this.queueCheck()
        }
        else {
          console.error('Update photo not implemented')
          Vue.store.queueRemovePhoto(photo.id)
          Vue.store.queueSetRunning(false)
        }
      }
      else {
        // New photo, add
        if (photo._delete) {
          console.info('Photo deleted before upload', photo)
          Vue.store.queueRemovePhoto(photo.id)
          photoUtil.deleteBlob(photo.src, photo.name)
          URL.revokeObjectURL(photo.src)
          Vue.store.queueSetRunning(false)
          this.queueCheck()
          return
        }
        photoUtil.getBlob(photo, function (blob) {
          console.info('Uploading photo ' + photo.id)

          data.append('photo', blob, photo.name)
          self.axios.post(url, data, config)
            .then(function (response) {
              console.debug('Response:')
              console.debug(response)
              let jobphoto = response.data
              let src = photo.src
              photo.id = jobphoto.id

              var img = new Image()
              img.onload = function () {
                console.log('Use remote image')
                photo.src = jobphoto.photo
                URL.revokeObjectURL(src)
                console.log('Save jobs...')
                Vue.store.jobsSave()
              }
              img.onerror = img.onload
              img.src = jobphoto.photo
              console.log('Load ' + img.src)

              Vue.store.queueRemovePhoto(photo.id)
              Vue.store.queueSetRunning(false)
              self.queueCheck()
              photoUtil.deleteBlob(src, photo.name)
            })
            .catch(function (error) {
              console.log(error)
              Vue.store.queueSetRunning(false)
            })
        })
      }
    }
  }
}
</script>

<style>
.q-toolbar { background: #0d65a3; }
.q-toolbar-title {
  background: url(https://server3.microdisseny.com/ajgirona/feines_proveidors/static/feines_proveidors/logo_ajgirona-white.svg) no-repeat left 10px;
  background-size: 36px 36px;
  padding: 10px 45px 10px
}

.q-btn.q-btn-rectangle {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  min-width: 40px
}

.q-btn.q-btn-rectangle.bg-micro {
  color: #fff;
  background: #3b8ac3;
}

/*.layout-view > div:first-child  {*/
div.data-sync {
    padding: 10px 15px;
    font-size: .8em;
    background: #e0edf6;
}

.q-item:nth-child(2n) {
    background-color: #e0edf6!important;
}
.q-item:nth-child(2n):hover {
    background-color: #ddd!important;
}

.bg-primary {
    background: #0d65a3 !important;
}

.q-tabs-head {
    background: #3b8ac3;
}

.q-tab-pane div >span {
  margin-right: 20px;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
	color: #fff;
  width:100%;
	height:100%;
  background: rgba(13, 101, 163, 0.9);
  position: absolute;
  z-index: 1000;
  text-align: center;
}

.loading i {
  font-size: 4em;
	vertical-align: middle;
  margin: 0px 0 10px 0;
}

</style>
