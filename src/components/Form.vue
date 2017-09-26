<template>
  <div>

  <image-input-resizer
    ref="imageinputresizer" 
    @ready="imageReady"
    />

  <div class="loading" v-if="loading">
    Loging in...
  </div>

  <div v-if="!loading">
<q-tabs no-pane-border>
  <q-tab default slot="title" name="tab-fitxa" icon="assignment" />
  <q-tab slot="title" name="tab-fotos" icon="photo" />

  <q-tab-pane name="tab-fitxa" style="padding-top: 0">
  <div>
    <q-select
      v-model="model.contract"
      v-show="showContract"
      float-label="Lot"
     :options="contractOptions"
    />

    <q-select
      v-model="model.elementType"
      float-label="Tipus d'element"
     :options="elementTypeOptions"
    />

<!-- real Sector selector -->
<div style="display: flex; align-items: center"
     v-show="showLocationOptions">
    <q-select
      filter
      ref="sectorSelect"
      v-model="model.location"
      float-label="Sector"
      :options="elementGroupsOptions"
      style="flex-grow: 1;"
      @created="searchSector"
    />

    <q-btn color="grey" icon="search" @click="searchSector" style="display:none" />
    <q-btn flat small @click="searchSector" ><q-icon name="search" /></q-btn>
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

    <q-btn color="grey" icon="close" @click="searchSectorClose" style="display: none"/>
    <q-btn flat small @click="searchSectorClose" ><q-icon name="close" /></q-btn>
</div>

    <q-select
      ref="tascaSelect"
      v-model="model.task"
      float-label="Task"
      :options="taskOptions"
    />

    <q-input
      v-model="model.note"
      type="textarea"
      float-label="Observacions"
      :max-height="100"
      :min-rows="1"
    />

    <div style="display: none; justify-content: space-between; margin: 40px 0px 5px 0px;">
      <q-btn icon="photo" @click="newPhoto(true)" style="">Foto abans</q-btn>
      <q-btn icon="photo" @click="newPhoto(false)" sytle="margin-left: auto;">Foto després</q-btn>
    </div>
  </div>
  </q-tab-pane>

  <q-tab-pane name="tab-fotos" style="padding: 0px">
    <div style="display: flex; justify-content: space-between; margin: 12px 10px 5px 9px;">
      <q-btn color="micro" icon="photo" @click="newPhoto(true)" style="">Foto abans</q-btn>
      <q-btn color="micro" icon="photo" @click="newPhoto(false)" sytle="margin-left: auto;">Foto després</q-btn>
    </div>
    
    <q-card inline v-for="item in gallery" :id="'photo_' + item.id">
      <q-card-media>
        <img @click="photoclick" :src="item.src" style="height: auto; width: 100%">
      </q-card-media>
      <q-card-title>
        <div style="font-size: 16px; line-height: 18px">Foto abans</div>
        <div style="font-size: 12px; line-height: 14px">Taken on 09/09/2017</div>
        <div slot="right">
          <q-btn flat small @click="photoclick" ><q-icon name="edit" /></q-btn>
          <q-btn flat small @click="photoclick" ><q-icon name="delete" /></q-btn>
        </div>
      </q-card-title>
    </q-card>

    <div v-if="gallery.length > 0" style="display: flex; justify-content: space-between; margin: 12px 10px 50px 9px;">
      <q-btn color="micro" icon="photo" @click="newPhoto(true)" style="">Foto abans</q-btn>
      <q-btn color="micro" icon="photo" @click="newPhoto(false)" sytle="margin-left: auto;">Foto després</q-btn>
    </div>

  </q-tab-pane>

</q-tabs>
  </div>
</div>
</template>

<script>
import Vue from 'vue'

import {
  QAutocomplete,
  QSearch,
  QInput,
  QSelect,
  QBtn,
  QTabs,
  QTab,
  QTabPane,
  QCard,
  QCardMedia,
  QCardTitle,
  QCardSeparator,
  QCardMain,
  QIcon
} from 'quasar'

import ImageInputResizer from './ImageInputResizer.vue'

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
    QCard,
    QCardMedia,
    QCardTitle,
    QCardSeparator,
    QCardMain,
    QIcon,
    ImageInputResizer
  },
  data () {
    return {
      loading: false,
      showContract: true,
      showLocationOptions: true,
      model: {
        // uuid: '',
        // contract: '',
        // elementType: '',
        // location: '',
        // task: '',
        // note: ''
      },
      gallery: [
        // Vue.API_ROOT + '/ajgirona/feines_proveidors/static/photos/mountains.jpg',
        // Vue.API_ROOT + '/ajgirona/feines_proveidors/static/photos/parallax1.jpg',
        // Vue.API_ROOT + '/ajgirona/feines_proveidors/static/photos/parallax2.jpg',
        // Vue.API_ROOT + '/ajgirona/feines_proveidors/static/photos/parallax1.jpg',
        // Vue.API_ROOT + '/ajgirona/feines_proveidors/static/photos/mountains.jpg',
        // Vue.API_ROOT + '/ajgirona/feines_proveidors/static/photos/parallax2.jpg'
      ],
      terms: '',
      sharedState: Vue.store.state
    }
  },
  computed: {
    contractOptions: function () {
      var options = []
      console.log(this.sharedState)
      console.log(this.sharedState.contracts)
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
      if (!this.model.elementType) {
        return options
      }
      this.sharedState.elementGroups.forEach(function (element) {
        if (element.types.includes(self.model.elementType)) {
          options.push({label: element.name, value: element.id})
        }
      })
      return options
    },
    taskOptions: function () {
      var options = []
      var self = this
      if (!this.model.elementType) {
        return options
      }
      this.sharedState.elementTasks.forEach(function (element) {
        if (element.types.includes(self.model.elementType)) {
          options.push({label: element.name, value: element.id})
        }
      })
      return options
    },
    modelData: function () {
      // watch all form variables
      // https://github.com/vuejs/vue/issues/844
      return (
        // this.model,
        this.model.contract,
        this.model.elementType,
        this.model.location,
        this.model.task,
        this.model.note,
        new Date())
    }
  },
  beforeRouteEnter (to, from, next) {
    if (to.path === '/form/add') {
      next(vm => {
        vm.model = {
          uuid: '',
          contract: '',
          elementType: '',
          location: '',
          task: '',
          note: ''
        }
        vm.model.uuid = vm.$moment().valueOf()
        vm.model.id = -vm.model.uuid

        // automatically select contract if there is only one option
        if (vm.contractOptions.length === 1) {
          vm.model.contract = vm.contractOptions[0].value
        }
      })
    }
    else {
      console.log('Load model ' + to.params.id + ' from sharedState')
      // if not found by ID, look in the store
      console.log(to)
      next(vm => {
        console.log(to.params.id)
        console.log(vm.sharedState.jobs)
        if (vm.sharedState.jobs[to.params.id]) {
          vm.model = vm.sharedState.jobs[to.params.id]
        }
        else {
          vm.$router.push('/')
          // throw 'not found'
        }
      })
    }
  },
  beforeRouteUpdate (to, from, next) {
    console.log('Params update while in this form is not supported')
  },
  created () {
    console.log('Form created')
  },
  mounted () {
  },
  watch: {
    'modelData': 'modelChanged'
  },
  methods: {
    includes (terms, {field, list}) {
      const token = terms.toLowerCase()
      return list.filter(item => ('' + item[field]).toLowerCase().includes(token))
    },
    search (terms, done) {
      console.log(this.elementGroupsOptions)
      // FIXME: _.debounce(function () {
      setTimeout(() => {
        console.log('Filter items...')
        done(this.includes(terms, {field: 'label', list: this.elementGroupsOptions}))
      }, 250)
    },
    selectedSector (item) {
      this.model.location = item.value
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
      window.moment = this.$moment
    },
    newPhoto (abans) {
      this.$refs.imageinputresizer.newImage()
    },
    imageReady (uri) {
      let now = this.$moment()
      this.gallery.push({
        src: uri,
        timestamp: now.format(this.$moment().ISO_8601),
        id: now.valueOf()
      })

      let self = this
      Vue.nextTick(function () {
        self.scrollToPhoto('photo_' + now.valueOf())
      })
    },
    scrollToPhoto (id) {
      console.log('scroll start')
      var options = {
        // container: '#' + id,
        // easing: 'ease-in',
        offset: -73,
        cancelable: true,
        onDone: function () {
          // scrolling is done
        },
        onCancel: function () {
          // scrolling has been interrupted
        },
        x: false,
        y: true
      }

      // or alternatively inside your components you can use
      this.$scrollTo('#' + id, 500, options)
      console.log('scroll end')
    },
    modelChanged () {
      // FIXME: debounce
      console.log('Model has changed!!!')
      Vue.set(this.sharedState.jobs, this.model.id, this.model)
      Vue.store.localStore.save({key: 'jobs', data: this.sharedState.jobs})
      window.local = Vue.store.localStore
    }
  }
}
</script>

<style>
.q-popover.animate-scale {
    animation: none;
}
</style>
