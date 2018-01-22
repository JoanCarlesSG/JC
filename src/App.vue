<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <q-layout
      ref="layout"
      view="lHh Lpr fff"
      :left-class="{'bg-grey-2': true}"
    >
      <q-toolbar slot="header" class="">
        <q-toolbar-title @click="$router.replace('/')" class="app_title">
          GESPARC - Registre de tasques
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
          <q-list-header
            v-if="sharedState.username">{{ sharedState.username }}</q-list-header>
          <q-item v-if="sharedState.username" @click="logout">
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
          Versió {{ vue.APP_VERSION }}
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
        <router-view ref="view" v-if="!loading" class="layout-view"
          @refresh="refresh"></router-view>
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
  QSlideTransition,
  Dialog
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
      sharedState: Vue.store.state,
      vue: Vue
    }
  },
  created: function () {
    console.log('App created')
    try {
      Vue.store.stateLoad()
      this.sharedState.queueCheckId = setInterval(this.queueCheck, 10000)
    }
    catch (e) {
      console.log(e)
    }
  },
  mounted () {
    console.log('App mounted')
    window.app = this
    if (Vue.store.isUserLoggedIn()) {
      this.fetchStartupData()
    }
    else {
      this.$router.replace('/login')
    }
  },
  watch: {
    // call again the method if the route changes
    '$route': 'routeChanged'
  },
  methods: {
    refresh () {
      this.fetchStartupData()
    },
    logout () {
      console.log('logout')
      this.$router.push('/logout')
      this.$refs.layout.hideCurrentSide()
    },
    routeChanged () {
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
        this.$router.replace('/login')
        console.log('Needs login')
      }
    },
    fetchStartupData () {
      let self = this
      console.log('Fetching remote data...')
      this.loading = true

      var config = {
        headers: {'Authorization': 'Bearer '.concat(this.sharedState.access_token)},
        timeout: 10000,
        params: {
          '_version': Vue.APP_VERSION,
          '_username': this.sharedState.username
        }
      }

      console.log('Fetching startup data')
      this.axios.get(Vue.API_ROOT + '/ajgirona/feines_proveidors/startup', config)
        .then(response => {
          console.log('startup response ok', response)
          // JSON responses are automatically parsed.
          Vue.store.startupLoadReferenceData(response.data)
          Vue.store.startupProcess(response.data)

          // Save startup cache
          Vue.store.stateSave()
          console.log('startup cache saved')
          self.loading = false
        })
        .catch(e => {
          console.log(e)
          if (e.request && e.request.status === 403) {
            self.loading = false
            self.$router.replace('/login')
          }
          else {
            console.log('startup response ERROR')
            let message
            if (e.message) {
              message = e.message
            }
            else {
              message = 'Error al contactar el servidor'
            }
            self.sharedState.errors.push(message)
            console.log(self.sharedState.errors)
            self.loading = false
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

      data.append('_version', Vue.APP_VERSION)
      data.append('_username', this.sharedState.username)

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
            if (error.response && error.response.status === 410) {
              Dialog.create({
                title: 'Error!',
                message: 'La feina que s\'està sincronitzant ja no existeix. Si heu estat notificats podeu esborrar els canvis que no s\'han sincronitzat. Altrament informeu de l\'error.',
                buttons: [
                  {
                    label: 'Sí, esborrar',
                    handler () {
                      Vue.store.queueRemoveJob(job.id)
                      Vue.store.jobsRemove(job.id)
                      Vue.store.queueSetRunning(false)
                    }
                  },
                  'És un error'
                ]
              })
            }
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
      data.append('_version', Vue.APP_VERSION)
      data.append('_username', self.sharedState.username)
      console.log(photo)

      if (photo.id > 0) {
        // Existing job
        if (photo._delete) {
          console.log('Delete existing photo', photo)
          url = Vue.API_ROOT + '/ajgirona/feines_proveidors/api/v1/jobphotos/' + photo.id + '/'

          self.axios.delete(url, config)
            .then(function (response) {
              console.debug('Photo deleted response:')
              console.debug(response)
              Vue.store.queueRemovePhoto(photo.id)
              Vue.store.queueSetRunning(false)
              self.queueCheck()
            })
            .catch(function (e) {
              console.log(e)
              if (e.request.status === 404) {
                Vue.store.queueRemovePhoto(photo.id)
              }
              Vue.store.queueSetRunning(false)
              self.queueCheck()
            })
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
              img.src = jobphoto.photo + '?access_token=' + self.sharedState.access_token
              console.log('Load ' + img.src)

              Vue.store.queueRemovePhoto(photo.id)
              Vue.store.queueSetRunning(false)
              self.queueCheck()
              photoUtil.deleteBlob(src, photo.name)
            })
            .catch(function (error) {
              console.error(error)
              if (error.response && error.response.status === 410) {
                Dialog.create({
                  title: 'Error!',
                  message: 'La photo que s\'està sincronitzant pertany a una feina que ja no existeix. Si heu estat notificats podeu esborrar els canvis que no s\'han sincronitzat. Altrament informeu de l\'error.',
                  buttons: [
                    {
                      label: 'Sí, esborrar',
                      handler () {
                        Vue.store.queueRemovePhoto(photo.id)
                        Vue.store.queueSetRunning(false)
                      }
                    },
                    'És un error'
                  ]
                })
              }
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
  background: url('./assets/app_logo.svg') no-repeat left 10px;
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

.q-btn.q-btn-rectangle.photo-small {
  padding: 10px 10px;
  width: 23%
}

.photo-small i.on-left {
  margin-right: 10px;
  margin-left: 10px;
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

.app_title {
  padding: 9px 5px 10px 45px;
  font-size: 0.98em;
}

</style>
