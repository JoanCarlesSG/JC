<template>
  <div>
    <image-input-resizer
      ref="imageinputresizer" 
      @ready="imageReady"
      />

    <div style="display: flex; justify-content: space-between; margin: 12px 10px 5px 9px;">
      <q-btn color="micro" icon="photo" @click="newPhoto(true)" style="">Foto abans</q-btn>
      <q-btn color="micro" icon="photo" @click="newPhoto(false)" sytle="margin-left: auto;">Foto després</q-btn>
    </div>
    
    <q-card inline v-for="item in photos" :key="item.id" :id="'photo_' + item.id">
      <q-card-media>
        <img :src="item.src" style="height: auto; width: 100%">
      </q-card-media>
      <q-card-title>
        <div style="font-size: 16px; line-height: 18px">Foto abans</div>
        <div style="font-size: 12px; line-height: 14px">Taken on 09/09/2017</div>
        <div slot="right">
          <q-btn flat small ><q-icon name="edit" /></q-btn>
          <q-btn flat small ><q-icon name="delete" /></q-btn>
        </div>
      </q-card-title>
    </q-card>

    <div v-if="photos.length > 0" style="display: flex; justify-content: space-between; margin: 12px 10px 50px 9px;">
      <q-btn color="micro" icon="photo" @click="newPhoto(true)" style="">Foto abans</q-btn>
      <q-btn color="micro" icon="photo" @click="newPhoto(false)" sytle="margin-left: auto;">Foto després</q-btn>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

import {
  QInput,
  QSelect,
  QBtn,
  QCard,
  QCardMedia,
  QCardTitle,
  QCardSeparator,
  QCardMain,
  QIcon
} from 'quasar'

import ImageInputResizer from './ImageInputResizer.vue'

export default {
  props: {
    parentId: Number,
    photos: Array
  },
  components: {
    QInput,
    QSelect,
    QBtn,
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
      sharedState: Vue.store.state
    }
  },
  methods: {
    newPhoto (abans) {
      this.$refs.imageinputresizer.newImage()
    },
    imageReady (uri) {
      let now = this.$moment()
      let photo = {
        src: uri,
        timestamp: now.format(this.$moment().ISO_8601),
        id: -now.valueOf(),
        parentId: this.parentId
      }
      this.photos.push(photo)
      this.sharedState.newPhotos.push(photo)

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
    }
  }
}
</script>

<style>
</style>
