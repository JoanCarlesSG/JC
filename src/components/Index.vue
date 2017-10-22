<template>
  <div class="layout-view">
    <sync />
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
              <q-item-tile sublabel>{{ $moment(item.created_on).format('L') }}</q-item-tile>
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

import Sync from './Sync.vue'

function compareJobs (a, b) {
  if (a.status === b.status) {
    if (a.updated_on === b.updated_on) {
      return 0
    }
    else {
      return a.updated_on < b.updated_on
    }
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
    QAlert,
    Sync
  },
  data () {
    return {
      jobs: {},
      sharedState: Vue.store.state
    }
  },
  computed: {
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
      let jobs = []
      Vue._.forOwn(vm.sharedState.jobs, function (value, key) {
        jobs.push(value)
      })

      Vue.set(vm, 'jobs', jobs.sort(compareJobs))
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
      Vue.set(this, 'jobs', [])
      Vue.set(this, 'jobs', this.sharedState.jobs)
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
      var text = ''
      Vue._.forEach(this.sharedState.contracts, function (value, key, collection) {
        let list = value.groups.filter(item => {
          // console.log('item.id', item.id)
          return (item.id === id)
        })
        if (list.length === 1) {
          text = list[0].name
          return false
        }
        return true
      })
      return text
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
</style>
