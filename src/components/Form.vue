<template>
  <div class="layout-padding">
    <div>Hello there!</div>

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
      :options="locationOptions"
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


  </div>
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
  QBtn
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
    QBtn
  },
  data () {
    return {
      showContract: true,
      showLocationOptions: true,
      contract: '',
      elementType: '',
      location: '',
      terms: '',
      countries: parseCountries(),
      contractOptions: [
        {label: 'Lot1', value: 1},
        {label: 'Lot2', value: 2}
      ],
      locationOptions: parseCountries(),
      elementTypeOptions: [
        {label: 'Arbre', value: 1},
        {label: 'Parterre', value: 2}
      ]
    }
  },
  methods: {
    search (terms, done) {
      // _.debounce(function () {
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
    }
  }
}
</script>

<style>
.q-popover.animate-scale {
    animation: none;
}
</style>
