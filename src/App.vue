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
          <q-list-header>manelclos@gmail.com</q-list-header>
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
          Versió 0.3.0
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
      setInterval(this.queueCheck, 10000)
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
      this.$refs.layout.hideCurrentSide()
      // this.$refs.layout.hideRight()
      this.$router.push('/logout')
    },
    routeChanged () {
      let self = this
      this.$refs.layout.hideRight()
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
        return
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

            console.log(this.startup)
            // Save startup cache
            Vue.store.localStore.save({key: 'startup', data: this.startup})
            console.log('startup cache saved')
            this.loading = false
          })
          .catch(e => {
            console.log(e)
            if (e.request.status === 403) {
              this.loading = false
              this.$router.push('/login')
            }
            else {
              console.log('startup response ERROR')
              this.errors.push(e)
              console.log(this.errors)
              this.loading = false
              Vue.store.localStore.get('startup', function (me) {
                console.log('startup cache')
                self.loadStartupData(me.data)
                this.loading = false
              })
            }
          })
      }
    },
    loadStartupData (startup, newJobs) {
      this.startup = startup
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
            console.log('Adding job ' + job.id)
            self.sharedState.jobs[job.id] = job
            job.photos.forEach(photo => {
              photoUtil.getBlob(photo, function (blob) {
                photo.src = URL.createObjectURL(blob)
              })
              photoCache[photo.id] = photo
            })
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

          job.contract = remoteJob.contract
          job.elementType = remoteJob.element_type
          job.location = remoteJob.element_group
          job.task = remoteJob.element_task
          job.note = remoteJob.note
          job.status = remoteJob.status

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

            if (isNew) {
              job.photos.push()
            }
          })

          Vue.store.jobsAdd(job)
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
      console.log('Uploading job ... ' + job.id)

      var config = {
        headers: {'Authorization': 'Bearer '.concat(this.sharedState.access_token)},
        timeout: 60000
      }

      var url = Vue.API_ROOT + '/ajgirona/feines_proveidors/api/v1/jobs/'

      const data = new FormData()
      data.append('contract', job.contract)
      data.append('elementType', job.elementType)
      data.append('location', job.location)
      data.append('task', job.task)
      data.append('note', job.note)
      if (job.photos.length > 0) {
        data.append('photos', job.photos)
      }

      this.axios.post(url, data, config)
        .then(function (response) {
          console.debug('Response:')
          console.debug(response)
          let data = response.data

          Vue.store.jobsMove(job, data.id)
          Vue.store.queueRemoveJob(job.id)
          job.photos.forEach(photo => {
            photo.job_id = job.id
          })
          Vue.store.queueSetRunning(false)
        })
        .catch(function (error) {
          console.log(error)
          Vue.store.queueSetRunning(false)
        })
    },
    uploadPhoto (photo) {
      let self = this
      console.log('Uploading photo ... ' + photo.id)

      var config = {
        headers: {'Authorization': 'Bearer '.concat(this.sharedState.access_token)},
        timeout: 60000
      }

      var url = Vue.API_ROOT + '/ajgirona/feines_proveidors/api/v1/jobphotos/'
      const data = new FormData()
      console.log(photo)

      photoUtil.getBlob(photo, function (blob) {
        console.info('Uploading photo ' + photo.id)

        data.append('photo', blob, photo.name)
        console.error('FIXME: add job id')
        data.append('job', photo.job_id)
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
