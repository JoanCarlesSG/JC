<template>
  <div class="layout-padding">
    <div>Hello there!</div>

    <q-select
      v-model="contract"
      float-label="Lot"
      radio
     :options="contractOptions"
    />

    <q-select
      v-model="location"
      float-label="Sector"
      radio
      filter
     :options="locationOptions"
    />

    <q-input color="amber" v-model="terms" placeholder="Type 'fre'">
      <q-autocomplete
        @search="search"
        :min-characters="2"
        @selected="selected"
      />
    </q-input>  

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

import {
  QAutocomplete,
  QSearch,
  QInput,
  Toast,
  filter,
  QSelect
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
    QSelect
  },
  data () {
    return {
      contract: '',
      location: '',
      terms: '',
      countries: parseCountries(),
      contractOptions: [
        {label: 'Lot1', value: 1},
        {label: 'Lot2', value: 2}
      ],
      locationOptions: parseCountries()
    }
  },
  methods: {
    search (terms, done) {
      setTimeout(() => {
        done(filter(terms, {field: 'value', list: parseCountries()}))
      }, 500)
    },
    selected (item) {
      console.log(item)
      Toast.create(`Selected suggestion "${item.label}"`)
    }
  }
}
</script>

<style>
</style>
