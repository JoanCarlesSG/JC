<template>
  <div>
    <q-slide-transition>
      <div v-if="needsSync" class="data-sync"
        >Sincronitzant dades
        <div class="sync-container">
          <q-transition group enter="fadeIn" leave="fadeOut">
            <div v-for="(item, index) in queuedPhotos" :key="item.id"
                class="sync-item"
              >
              <img :src="item.src" style="height: 40px" />
              <q-transition enter="fadeIn" leave="fadeOut">
                <div class="spin" v-if="sharedState.queue.running && (sharedState.queue.uploading == item)"
                  ><q-icon name="sync" class="animate-spin-reverse"
                        /></div>
              </q-transition>
            </div>
            <div v-for="item in queuedJobs" :key="item.id"
                class='sync-item'
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
    </q-slide-transition>
  </div>
</template>

<script>
import Vue from 'vue'

import {
  QIcon,
  QSlideTransition,
  QTransition
} from 'quasar'

export default {
  components: {
    QIcon,
    QSlideTransition,
    QTransition
  },
  data () {
    return {
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
  methods: {
    getItemLabel (item) {
      return this.getLocationText(item.location)
    },
    getLocationText (id) {
      // TODO: refactor getLocationText into Vue.store ...
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
    }
  }
}
</script>

<style>
.sync-container span {
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
}

.sync-item {
  margin: 8px 0 0 10px;
  height: 40px;
  text-align: center;
}

div.spin {
  color: white;
  text-align: center;
  font-size: 36px;
  position: relative;
  top: -47px;
}
</style>
