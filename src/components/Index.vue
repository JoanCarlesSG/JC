<template>
<div>
  <q-fixed-position v-if="!sharedState.fatalState" corner="bottom-right" :offset="[18, 18]" style="z-index: 500">
    <q-btn id="add-button" round color="primary" @click="add_job" icon="add"/>
  </q-fixed-position>

  <q-pull-to-refresh :handler="refresher"
    pull-message="Tireu per actualitzar"
    release-message="Deixeu anar per actualitzar"
    refresh-message="Refrescant...">

    <div class="layout-view">
      <sync />

      <q-alert
        v-for="msg in sharedState.messages"
        :key="msg.id"
        :color="alertType(msg.type)"
        @input="v => { if (!v) dismissMessage(msg) }"
        :dismissible="!sharedState.fatalState || msg.type !== 'fatal'"
      >
        <div class="message" v-html="msg.message"></div>
      </q-alert>

      <q-alert
        v-for="error in sharedState.errors"
        :key="error"
        type="negative"
        ref="destroyableAlert"
        dismissible
      >
        {{ error }}
      </q-alert>

      <q-tabs no-pane-border v-model="selectedTab">
        <q-tab default slot="title" name="tab-actuals" label="Actuals" />
        <q-tab slot="title" name="tab-futures" label="Futures" />

        <q-tab-pane name="tab-actuals" style="padding: 0">

      <q-list v-if="!sharedState.fatalState" no-border striped>
        <q-list-header>Feines actuals</q-list-header>
        <q-alert
          v-if="jobs.length === 0"
          icon="info"
          color="positive"
          style="margin: 0 15px"
        >Per afegir una feina, feu servir el botó situat a la part inferior dreta de la pantalla
        </q-alert>
        <q-item v-for="item in currentJobs" :key="item.id" :to="'/form/' + item.id">
            <q-item-side left :icon="getItemIcon(item)" />
            <q-item-main>
              <q-item-tile label>{{ getItemLabel(item) }}</q-item-tile>
              <q-item-tile sublabel>{{ getItemSublabel(item) }}</q-item-tile>
              <q-item-tile v-if="item.status === 'planned'" sublabel>{{ $moment(item.planned_start_date).format('L') }}</q-item-tile>
              <q-item-tile v-else sublabel>{{ $moment(item.updated_on).format('L') }}</q-item-tile>
            </q-item-main>
            <q-item-side right icon="keyboard_arrow_right" />
          </router-link>
        </q-item>
      </q-list>
        </q-tab-pane>

        <q-tab-pane name="tab-futures" style="padding: 0">

      <q-list v-if="!sharedState.fatalState" no-border striped>
        <q-list-header>Feines futures</q-list-header>
        <q-alert
          v-if="jobs.length === 0"
          icon="info"
          color="positive"
          style="margin: 0 15px"
        >No teniu cap tasca programada
        </q-alert>
        <q-item v-for="item in futureJobs" :key="item.id" :to="'/form/' + item.id">
            <q-item-side left :icon="getItemIcon(item)" />
            <q-item-main>
              <q-item-tile label>{{ getItemLabel(item) }}</q-item-tile>
              <q-item-tile sublabel>{{ getItemSublabel(item) }}</q-item-tile>
              <q-item-tile v-if="item.status === 'planned'" sublabel>{{ $moment(item.planned_start_date).format('L') }}</q-item-tile>
              <q-item-tile v-else sublabel>{{ $moment(item.updated_on).format('L') }}</q-item-tile>
            </q-item-main>
            <q-item-side right icon="keyboard_arrow_right" />
          </router-link>
        </q-item>
      </q-list>
        </q-tab-pane>

      </q-tabs>
    </div>
  </q-pull-to-refresh>
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
  QTabs,
  QTab,
  QTabPane,
  QTransition,
  QAlert,
  QPullToRefresh
} from 'quasar'

import Sync from './Sync.vue'

const alertTypeRefs = {
  info: 'info',
  warning: 'warning',
  error: 'negative',
  fatal: 'negative'
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
    QTabs,
    QTab,
    QTabPane,
    QTransition,
    QAlert,
    Sync,
    QPullToRefresh
  },
  data () {
    return {
      jobs: [],
      selectedTab: 'tab-actuals',
      sharedState: Vue.store.state
    }
  },
  computed: {
    currentJobs () {
      const tomorrow = this.$moment().startOf('day').add(1, 'day')
      return this.jobs.filter(job => !this.isFutureJob(job, tomorrow, job.status))
    },
    futureJobs () {
      const tomorrow = this.$moment().startOf('day').add(1, 'day')
      return this.jobs.filter(job => this.isFutureJob(job, tomorrow, job.status))
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      Vue.set(vm.sharedState, 'currentView', vm)
      vm.jobsChanged()
    })
  },
  beforeRouteUpdate (to, from, next) {
    next(vm => {
      vm.jobsChanged()
    })
  },
  watch: {
    'sharedState.jobs': 'jobsChanged'
  },
  methods: {
    compareJobs (a, b) {
      if (a.status === b.status) {
        if (a.updated_on === b.updated_on) {
          return 0
        }
        else {
          return (a.updated_on < b.updated_on) ? 1 : -1
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
    },
    add_job () {
      this.$router.push('/form/add')
    },
    jobsChanged () {
      console.warn('Jobs changed!')
      Vue.set(this, 'jobs', [])

      let jobs = []
      Vue._.forOwn(this.sharedState.jobs, function (value, key) {
        jobs.push(value)
      })

      Vue.set(this, 'jobs', jobs.sort(this.compareJobs))
    },
    getItemIcon (item) {
      if (item.status === 'open') {
        return 'create'
      }
      else if (item.status === 'done') {
        return 'check'
      }
      else if (item.status === 'planned') {
        return 'alarm'
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
    },
    isFutureJob (job, futureDate) {
      if (job.status !== 'planned') {
        return false
      }
      const plannedStart = this.$moment(job.planned_start_date)
      if (plannedStart < futureDate) {
        return false
      }

      return true
    },
    refresher (done) {
      // done - Function to call when you made all necessary updates.
      //        DO NOT forget to call it otherwise the refresh message
      //        will continue to be displayed
      // make some Ajax call then call done()
      this.$emit('refresh')
      done()
    },
    alertType (type) {
      return alertTypeRefs[type]
    },
    dismissMessage (msg) {
      const i = this.sharedState.messages.indexOf(msg)
      this.sharedState.messages.splice(i, 1)
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

.message a
  color white
  font-weight bolder

.bg-info
  background-color #337ab7 !important

</style>
