<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <q-layout
      ref="layout"
      view="lHh Lpr fff"
      :left-class="{'bg-grey-2': true}"
    >
      <q-toolbar slot="header" class="">
        <q-toolbar-title>
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
          <q-item to="/report">
            <q-item-side icon="bug_report" />
            <q-item-main label="Comunicar incidència" />
          </q-item>
          <q-item to="/help">
            <q-item-side icon="help" />
            <q-item-main label="Ajuda" />
          </q-item>
        </q-list>
        <p style="text-align: center; margin-top: 30px; font-size: 0.8em" class="text-grey-7">
          Powered by <a target="_blank" href="http://www.microdisseny.com">Microdisseny</a>
        </p>
      </div>

      <!--
        Replace following <div> with
        <router-view /> component
        if using subRoutes
      -->
      <div class="loading" v-if="loading">
        Loading...
      </div>
      <div v-if="!loading">
        <router-view />
      </div>
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
  QItemMain
} from 'quasar'

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
    QItemMain
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
      this.sharedState.access_token = localStorage.getItem('access_token')
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
      console.log(this.sharedState.access_token)
      if (this.sharedState.access_token == null) {
        this.loading = false
        this.$router.push('/login')
        console.log('Needs login')
        return
      }

      console.log('Fetch data?')
      if (this.startup == null) {
        console.log('Fetching data...')

        var config = {
          headers: {'Authorization': 'Bearer '.concat(this.sharedState.access_token)},
          timeout: 10000
        }

        // Fetches posts when the component is created.
        this.axios.get(Vue.API_ROOT + '/ajgirona/feines_proveidors/startup', config)
          .then(response => {
            console.log('startup response ok')
            // JSON responses are automatically parsed.
            this.startup = response.data
            this.sharedState.contracts = this.startup.contracts
            this.sharedState.elementTypes = this.startup.element_types
            this.sharedState.elementGroups = this.startup.element_groups
            this.sharedState.elementTasks = this.startup.element_tasks
            console.log(this.startup)
            this.loading = false
          })
          .catch(e => {
            console.log('startup response ERROR')
            this.errors.push(e)
            console.log(this.errors)
            this.loading = false
            this.$router.push('/login')
          })
      }
    }
  }
}
</script>

<style></style>
