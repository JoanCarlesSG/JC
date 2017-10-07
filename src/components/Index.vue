<template>
  <div class="layout-view">
    <q-transition enter="slideInDown" leave="slideOutUp">
      <div v-if="needsSync" class="data-sync"
        >Sincronitzant dades
        <div class="sync-container">
          <q-transition group enter="fadeIn" leave="fadeOut">
            <div v-for="(item, index) in queuedPhotos" :key="item.id"
                :class="{'sync-item': true}"
              >
              <img :src="item.src" style="height: 40px" />
              <q-transition enter="fadeIn" leave="fadeOut">
                <div class="spin" v-if="sharedState.queue.running && (sharedState.queue.uploading == item)"
                  ><q-icon name="sync" class="animate-spin-reverse"
                        /></div>
              </q-transition>
            </div>
            <div v-for="item in queuedJobs" :key="item.id"
                class='sync-item' style="margin: 8px 0 0 10px; text-align: center"
              >
              <div style="height: 40px">Sector<br/>{{ getItemLabel(item) }}</div>
              <q-transition enter="fadeIn" leave="fadeOut">
                <div class="spin" v-if="sharedState.queue.running && (sharedState.queue.uploading == item)"
                  ><q-icon name="sync" class="animate-spin-reverse"
                        /></div>
              </q-transition>
            </div>
          </q-transition>
        </div>
      </div>
    </q-transition>

      <q-fixed-position corner="bottom-right" :offset="[18, 18]" style="z-index: 500">
        <q-btn round color="primary" @click="add_job" icon="add"/>
      </q-fixed-position>

      <q-list no-border striped>
        <q-list-header>Feines</q-list-header>
        <q-alert
          v-if="jobs.length === 0"
          icon="info"
          color="positive"
          style="margin: 0 15px"
        >Per afegir una feina, feu servir el botó situat a la part inferior dreta de la pantalla
        </q-alert>
        <q-item v-for="item in jobs" :key="item.id" :to="'/form/' + item.id">
            <q-item-side left :icon="getItemIcon(item)" />
            <q-item-main>
              <q-item-tile label>{{ getItemLabel(item) }}</q-item-tile>
              <q-item-tile sublabel>{{ getItemSublabel(item) }}</q-item-tile>
            </q-item-main>
            <q-item-side right icon="keyboard_arrow_right" />
          </router-link>
        </q-item>
      </q-list>

    </div>
</template>

<script>
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
  QItemTile,
  QFixedPosition,
  QTransition,
  QAlert
} from 'quasar'

function compareJobs (a, b) {
  if (a.status === b.status) {
    return 0
  }
  if (a.status === 'open') {
    return -1
  }
  if (b.status === 'open') {
    return 1
  }
  if (a.status === 'done') {
    return 1
  }
  if (b.status === 'done') {
    return -1
  }
}

export default {
  name: 'index',
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
    QItemTile,
    QFixedPosition,
    QTransition,
    QAlert
  },
  data () {
    return {
      jobs: {},
      sharedState: Vue.store.state
    }
  },
  computed: {
    needsSync: function () {
      if (this.sharedState.version < 0) {
        return true
      }
      return this.sharedState.queue.jobs.length > 0 ||
             this.sharedState.queue.photos.length > 0 ||
             this.sharedState.queue.running
    },
    queuedJobs: function () {
      if (this.sharedState.version < 0) {
        return true
      }
      return this.sharedState.queue.jobs.slice().reverse()
    },
    queuedPhotos: function () {
      if (this.sharedState.version < 0) {
        return true
      }
      return this.sharedState.queue.photos.slice().reverse()
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      Vue.set(vm, 'jobs', [])
      let jobs = []
      Vue._.forOwn(vm.sharedState.jobs, function (value, key) {
        jobs.push(value)
      })

      Vue.set(vm, 'jobs', jobs.sort(compareJobs))
    })
  },
  beforeRouteUpdate (to, from, next) {
    next(vm => {
      Vue.set(vm, 'jobs', [])
      Vue.set(vm, 'jobs', vm.sharedState.jobs)
    })
  },
  watch: {
    'sharedState.jobs': 'jobsChanged'
  },
  methods: {
    add_job () {
      this.$router.push('/form/add')
    },
    jobsChanged () {
      console.warn('Jobs changed!')
    },
    getItemIcon (item) {
      if (item.status === 'open') {
        return 'create'
      }
      else if (item.status === 'done') {
        return 'check'
      }
      else if (item.status === 'pending') {
        return 'hourglass_empty'
      }
      else {
        return 'create'
      }
    },
    getItemLabel (item) {
      return this.getLocationText(item.location)
    },
    getItemSublabel (item) {
      var text = ''
      var type = this.getElementTypeText(item.elementType)
      var task = this.getElementTaskText(item.task)
      if (type) {
        text = type
        if (task) {
          text = type + ' - ' + task
        }
      }
      else if (task) {
        text = task
      }
      return text
    },
    getLocationText (id) {
      let list = this.sharedState.elementGroups.filter(item => {
        return (item.id === id)
      })
      if (list.length === 1) {
        return list[0].name
      }
      else {
        return ''
      }
    },
    getElementTypeText (id) {
      let list = this.sharedState.elementTypes.filter(item => {
        return (item.id === id)
      })
      if (list.length === 1) {
        return list[0].name
      }
      else {
        return ''
      }
    },
    getElementTaskText (id) {
      let list = this.sharedState.elementTasks.filter(item => {
        return (item.id === id)
      })
      if (list.length === 1) {
        return list[0].name
      }
      else {
        return ''
      }
    }
  },
  mounted () {
  },
  beforeDestroy () {
  }
}
</script>

<style lang="stylus">
.logo-container
  width 192px
  height 268px
  perspective 800px
  position absolute
  top 50%
  left 50%
  transform translateX(-50%) translateY(-50%)

.logo
  position absolute
  transform-style preserve-3d

.sync-container span {
  display: flex
  flex-direction: row-reverse
  flex-wrap: wrap
}

.sync-item {
  margin: 8px 0 0 10px
  height: 40px
}

div.spin {
  color: white
  text-align: center
  font-size: 36px
  position: relative
  top: -47px
}
</style>
