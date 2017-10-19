<template>
  <div>

  <div class="loading" v-if="loading">
    Loging in...
  </div>

  <div v-if="!loading">
<q-tabs no-pane-border v-model="selectedTab">
  <q-tab default slot="title" name="tab-fitxa" icon="assignment" />
  <q-tab slot="title" name="tab-fotos" icon="photo" />
  <q-tab slot="title" name="tab-sector" icon="map" />

  <q-tab-pane name="tab-fitxa" style="padding-top: 0">
  <div>
    <q-select
      v-model="model.contract"
      v-show="showContract"
      float-label="Lot"
     :options="contractOptions"
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
    v-model="model.elementType"
    float-label="Tipus d'element"
    :options="elementTypeOptions"
    />

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

    <div v-if="model.status != 'done'" style="justify-content: space-between; margin: 40px 0px 5px 0px; text-align: right">
      <q-btn small color="micro" icon="done" @click="tancarTasca" sytle="margin-left: auto;">Tancar tasca</q-btn>
    </div>
    <div v-if="model.status == 'done'" style="justify-content: space-between; margin: 40px 0px 5px 0px; text-align: left">
      <q-btn small color="micro" icon="create" @click="reobrirTasca" sytle="margin-right: auto;">Reobrir tasca</q-btn>
    </div>
    <p style="text-align: center; color: #bbb; margin-top: 50px; font-size: 12px">Feina número {{ this.model.id }}</p>
  </div>
  </q-tab-pane>

  <q-tab-pane name="tab-fotos" style="padding: 0px">
    <photos :photos="model.photos" @newPhoto="newPhoto" @deletePhoto="deletePhoto" />
  </q-tab-pane>

  <q-tab-pane name="tab-sector" style="padding: 0px">
    <p style="padding: 20px 20px 5px 20px"
      ><b>Sector:</b> {{ this.currentGroup.code }} - {{ this.currentGroup.name }}</p>
    <img :src="getSectorImage()" style="height: auto; width: 100%" />
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
  QIcon,
  Dialog
} from 'quasar'

import Photos from './Photos.vue'

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
    Photos
  },
  data () {
    return {
      loading: false,
      selectedTab: 'tab-fitxa',
      showContract: true,
      showLocationOptions: true,
      needsSave: false,
      isReady: false,
      model: {
        // uuid: '',
        // contract: '',
        // elementType: '',
        // location: '',
        // task: '',
        // note: ''
        photos: []
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
      let self = this
      var options = []

      if (!this.model.location) {
        return options
      }

      this.sharedState.elementTypes.forEach(function (element) {
        // console.log(element)
        if (self.currentGroup.types.includes(element.id)) {
          options.push({label: element.name, value: element.id})
        }
      })
      return options
    },
    elementGroupsOptions: function () {
      var options = []
      var self = this
      if (!this.model.contract) {
        return options
      }
      this.sharedState.contracts.forEach(function (contract) {
        if (contract.id === self.model.contract) {
          contract.groups.forEach(function (element) {
            // if (element.types.includes(self.model.elementType)) {
            options.push({label: element.name, value: element.id})
            // }
          })
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
        this.model.photos,
        this.model.status,
        new Date())
    },
    currentGroup: function () {
      let self = this
      var group
      this.sharedState.contracts.forEach(function (contract) {
        if (contract.id === self.model.contract) {
          contract.groups.forEach(function (element) {
            if (element.id === self.model.location) {
              group = element
            }
          })
        }
      })
      if (!group) {
        group = {code: '0000', name: 'Sector no trobat', types: []}
      }
      return group
    }
  },
  beforeRouteEnter (to, from, next) {
    if (to.path === '/form/add') {
      next(vm => {
        if (vm.sharedState.contracts.length === 0) {
          console.warn('No contracts, redirecting to Index')
          vm.$router.push('/')
          return
        }

        vm.isReady = false

        vm.model = {
          contract: '',
          elementType: '',
          location: '',
          task: '',
          note: '',
          photos: []
        }
        let now = vm.$moment()
        vm.model.started_on = now.valueOf()
        console.log(now, vm.model.started_on, 'wooooooop')
        vm.model.id = -vm.model.started_on

        Vue.store.jobsAdd(vm.model)
        Vue.store.queueAddJob(vm.model)

        vm.needsSave = false
        vm.selectedTab = 'tab-fitxa'
        Vue.nextTick(function () {
          vm.isReady = true
        })

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
        console.log(vm.sharedState.contracts)
        if (vm.sharedState.contracts.length === 0) {
          console.warn('No contracts, redirecting to Index')
          vm.$router.push('/')
          return
        }

        vm.isReady = false

        console.log(to.params.id)
        console.log(vm.sharedState.jobs)
        if (vm.sharedState.jobs[to.params.id]) {
          vm.model = vm.sharedState.jobs[to.params.id]
          if (!vm.model.photos) {
            vm.model.photos = []
          }
          vm.needsSave = false
          vm.selectedTab = 'tab-fitxa'
          Vue.nextTick(function () {
            vm.isReady = true
          })
        }
        else {
          console.error('Job not found', to.params)
          vm.$router.push('/')
          // throw 'not found'
        }
      })
    }
  },
  beforeRouteUpdate (to, from, next) {
    console.log('Params update while in this form is not supported')
  },
  beforeRouteLeave (to, from, next) {
    console.log('FORM leaveing to: ', to)
    console.log('from: ', from)
    console.log('this:', this)
    console.log('needsSave', this.needsSave)
    if (this.needsSave) {
      this.needsSave = false
      Vue.store.queueAddJob(this.model)
      Vue.store.jobsSave()
    }
    next(vm => {
      console.log('NEXT <--------------------')
    })
  },
  created () {
    console.debug('Form created')
  },
  mounted () {
  },
  watch: {
    'modelData': 'modelChanged',
    'model.location': 'modelLocationChanged'
  },
  methods: {
    includes (terms, {field, list}) {
      const token = terms.toLowerCase()
      return list.filter(item => ('' + item[field]).toLowerCase().includes(token))
    },
    search: Vue._.debounce(function (terms, done) {
      console.log('Filter items...')
      done(this.includes(terms, {field: 'label', list: this.elementGroupsOptions}))
    }, 100),
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
    modelChanged: function () {
      if (this.isReady) {
        console.debug('Model has changed!!!')
        this.needsSave = true
        this.modelSave()
      }
    },
    modelLocationChanged: function () {
      // automatically select element type if there is only one option
      if (this.elementTypeOptions.length === 1) {
        this.model.elementType = this.elementTypeOptions[0].value
      }
      else {
        this.model.elementType = 0
      }
    },
    modelSave: Vue._.debounce(function () {
      if (this.needsSave) {
        try {
          Vue.store.jobsSave()
          console.log('localStorage used: ' + JSON.stringify(localStorage).length / 1024 + ' KB')
        }
        catch (e) {
          console.log(e)
          alert('Not enough space on local storage')
        }
        window.local = Vue.store.localStore
      }
    }, 5000),
    tancarTasca: function () {
      let self = this
      var fotoAbans = this.model.photos.some(f => f.type === 'abans')
      var fotoDespres = this.model.photos.some(f => f.type === 'despres')

      if (this.model.contract &&
          this.model.elementType &&
          this.model.location &&
          this.model.task) {
        if (fotoAbans && fotoDespres) {
          Vue.set(this.model, 'status', 'done')
          Vue.nextTick(function () {
            self.$router.push('/')
          })
        }
        else {
          Dialog.create({
            title: 'Atenció!',
            message: 'Cal una fotografia abans i una fotografia després',
            buttons: [
              'D\'acord'
            ]
          })
        }
      }
      else {
        Dialog.create({
          title: 'Atenció!',
          message: 'Cal que completeu el formulari abans de tancar la tasca',
          buttons: [
            'D\'acord'
          ]
        })
      }
    },
    reobrirTasca: function () {
      Vue.set(this.model, 'status', 'open')
    },
    newPhoto: function (photo) {
      photo.job_id = this.model.id
      Vue.store.jobsSave()
      Vue.store.queueAddPhoto(photo)
    },
    deletePhoto: function (photo) {
      Vue.set(photo, '_delete', true)
      Vue.store.jobsSave()
      Vue.store.queueAddPhoto(photo)
    },
    getSectorImage: function () {
      return Vue.API_ROOT + '/ajgirona/feines_proveidors/static/sectors/' + this.currentGroup.code + '.jpg'
    }
  }
}
</script>

<style>
.q-popover.animate-scale {
    animation: none;
}
</style>
