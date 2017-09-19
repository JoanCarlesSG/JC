<template>
<q-tabs no-pane-border>
  <q-tab default slot="title" name="tab-fitxa" label="Fitxa" icon="assignment" />
  <q-tab slot="title" name="tab-fotos" label="Fotos" icon="photo" />

  <q-tab-pane name="tab-fitxa" style="padding-top: 0">
  <div>
    <q-select
      v-model="contract"
      v-show="showContract"
      float-label="Lot"
     :options="contractOptions"
    />

    <q-select
      v-model="elementType"
      float-label="Tipus d'element"
     :options="elementTypeOptions"
    />

<!-- real Sector selector -->
<div style="display: flex; align-items: center"
     v-show="showLocationOptions">
    <q-select
      filter
      ref="sectorSelect"
      v-model="location"
      float-label="Sector"
      :options="elementGroupsOptions"
      style="flex-grow: 1;"
      @created="searchSector"
    />

    <q-btn color="grey" icon="search" @click="searchSector" />
</div>

<!-- search box for sector -->
<div style="display: flex; align-items: center"
     v-show="!showLocationOptions">
    <q-input color="amber" v-model="terms"
             style="flex-grow: 1;"
             ref="sectorSearch"
             float-label="Type to search a sector"
             @focus="$event.target.select()"
             >
      <q-autocomplete
        @search="search"
        :min-characters="2"
        @selected="selectedSector"
      />
    </q-input>

    <q-btn color="grey" icon="close" @click="searchSectorClose" />
</div>

    <q-select
      ref="tascaSelect"
      v-model="task"
      float-label="Task"
      :options="taskOptions"
    />

    <q-input
      v-model="note"
      type="textarea"
      float-label="Observacions"
      :max-height="100"
      :min-rows="1"
    />

    <div style="margin-top: 50px; text-align: center">
      <q-btn icon="photo">New photo</q-btn>
    </div>
    
    Photo:
    <input type="file" />
  </div>
  </q-tab-pane>

  <q-tab-pane name="tab-fotos">
    <div style="display: flex; flex-flow: row wrap">
      <div v-for="item in gallery" style="width: 60%; flex: auto; margin: 0 0 12px 0">
        <img @click="photoclick" :src="item" style="height: auto; width: 100%">
        <div style="text-align: right"><span>Foto abans</span><q-btn icon="delete"></q-btn></div>
      </div>
    </div>

  </q-tab-pane>

</q-tabs>
</template>

<script>
/*
<q-search v-model="terms" placeholder="Start typing a country name">
  <q-autocomplete @search="search" @selected="selected" />
</q-search>

<q-autocomplete v-model="terms" @search="search"></q-autocomplete>

<q-autocomplete v-model="terms" @search="search" @selected="selected" :delay="0" :max-results="20" class="full-width">
  <q-search v-model="terms" placeholder="Start typing a country name" />
</q-autocomplete>
*/
import countries from 'data/autocomplete.json'

import Vue from 'vue'

import {
  QAutocomplete,
  QSearch,
  QInput,
  filter,
  QSelect,
  QBtn,
  QTabs,
  QTab,
  QTabPane,
  QGallery
} from 'quasar'

function parseCountries () {
  console.log('parseCountries')
  return countries.map(country => {
    return {
      label: country,
      // sublabel: 'sublabel',
      value: country
    }
  })
}

export default {
  components: {
    QAutocomplete,
    QSearch,
    QInput,
    QSelect,
    QBtn,
    QTabs,
    QTab,
    QTabPane,
    QGallery
  },
  data () {
    return {
      showContract: true,
      showLocationOptions: true,
      contract: '',
      elementType: '',
      location: '',
      task: '',
      note: '',
      gallery: [
        Vue.API_ROOT + '/ajgirona/feines_proveidors/static/photos/mountains.jpg',
        Vue.API_ROOT + '/ajgirona/feines_proveidors/static/photos/parallax1.jpg',
        Vue.API_ROOT + '/ajgirona/feines_proveidors/static/photos/parallax2.jpg',
        Vue.API_ROOT + '/ajgirona/feines_proveidors/static/photos/parallax1.jpg',
        Vue.API_ROOT + '/ajgirona/feines_proveidors/static/photos/mountains.jpg',
        Vue.API_ROOT + '/ajgirona/feines_proveidors/static/photos/parallax2.jpg'
      ],
      terms: '',
      countries: parseCountries(),
      locationOptions: parseCountries(),
      sharedState: Vue.store.state
    }
  },
  computed: {
    contractOptions: function () {
      var options = []
      this.sharedState.contracts.forEach(function (element) {
        // console.log(element)
        options.push({label: element.name, value: element.id})
      })
      return options
    },
    elementTypeOptions: function () {
      var options = []
      this.sharedState.elementTypes.forEach(function (element) {
        // console.log(element)
        options.push({label: element.name, value: element.id})
      })
      return options
    },
    elementGroupsOptions: function () {
      var options = []
      var self = this
      if (!this.elementType) {
        return options
      }
      this.sharedState.elementGroups.forEach(function (element) {
        if (element.types.includes(self.elementType)) {
          options.push({label: element.name, value: element.id})
        }
      })
      return options
    },
    taskOptions: function () {
      var options = []
      var self = this
      if (!this.elementType) {
        return options
      }
      this.sharedState.elementTasks.forEach(function (element) {
        if (element.types.includes(self.elementType)) {
          options.push({label: element.name, value: element.id})
        }
      })
      return options
    }
  },
  created () {
    console.log('Form created')
  },
  mounted () {
    if (this.$route.path === '/form/add') {
      if (this.contractOptions.length === 1) {
        this.contract = this.contractOptions[0].value
      }
    }
  },
  methods: {
    search (terms, done) {
      console.log(this.countries)
      // FIXME: _.debounce(function () {
      setTimeout(() => {
        console.log('Filter items...')
        done(filter(terms, {field: 'value', list: this.countries}))
      }, 250)
    },
    selectedSector (item) {
      this.location = item.value
      this.searchSectorClose()
    },
    searchSector () {
      console.log('Search!!!')
      this.showLocationOptions = false
      var self = this
      Vue.nextTick(function () {
        self.$refs.sectorSearch.$refs.input.focus()
      })
    },
    searchSectorClose () {
      this.showLocationOptions = true
    },
    photoclick (event) {
      console.log('photo click')
      console.log(event.target.src)
    }
  }
}
</script>

<style>
.q-popover.animate-scale {
    animation: none;
}
</style>
