<template>
  <div>
    <image-input-resizer
      ref="imageinputresizer"
      @ready="imageReady"
      />

    <div v-if="!readonly" style="display: flex; justify-content: space-between; margin: 12px 10px 5px 9px;">
      <q-btn color="micro" icon="photo" @click="newPhoto(true)" style="">Foto abans</q-btn>
      <q-btn color="micro" icon="photo" @click="newPhoto(false)" sytle="margin-left: auto;">Foto després</q-btn>
    </div>

    <q-card inline v-if="displayPhoto(item)" v-for="item in photos" :key="item.id" :id="'photo_' + item.id">
      <q-card-media>
        <img :src="item.src + '?access_token=' + sharedState.access_token" style="height: auto; width: 100%">
      </q-card-media>
      <q-card-title>
        <div style="font-size: 16px; line-height: 18px">{{ item.description }}</div>
        <div class="upper" style="font-size: 12px; line-height: 14px">{{ $moment(item.taken_on).format('LLL') }}</div>
        <div v-if="!readonly" slot="right">
          <!-- <q-btn flat small ><q-icon name="edit" /></q-btn> -->
          <q-btn flat small @click="deletePhoto(item)" ><q-icon name="delete" /></q-btn>
        </div>
      </q-card-title>
    </q-card>

    <div v-if="photos.length > 0 && !readonly" style="display: flex; justify-content: space-between; margin: 12px 10px 50px 9px;">
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
  QIcon,
  Dialog
} from 'quasar'

import ImageInputResizer from './ImageInputResizer.vue'

export default {
  props: {
    photos: Array,
    readonly: {type: Boolean, required: true}
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
    newPhoto (abans, gallery) {
      let photo = {}
      if (abans) {
        photo.description = 'Foto abans'
        photo.type = 'abans'
      }
      else {
        photo.description = 'Foto després'
        photo.type = 'despres'
      }

      photo.gallery = gallery

      this.$refs.imageinputresizer.newImage(photo)
    },
    deletePhoto (photo) {
      let self = this
      Dialog.create({
        title: 'Atenció!',
        message: 'Esteu segurs que voleu esborrar aquesta fotografia',
        buttons: [
          'No',
          {
            label: 'Sí, esborrar',
            handler () {
              Vue._.remove(self.photos, function (n) {
                return n.id === photo.id
              })
              self.$emit('deletePhoto', photo)
            }
          }
        ]
      })
    },
    displayPhoto (photo) {
      if (photo._delete) {
        return false
      }
      return true
    },
    cordovaSaveFile (photo) {
      let self = this
      window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, function (fs) {
        console.log(fs)
        fs.root.getFile(photo.name, { create: true, exclusive: false }, function (fileEntry) {
          console.log(fileEntry)
          fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function (e) {
              console.log('IMAGE SAVED TO DISK')
              photo.src = fileEntry.toURL()
              delete photo.blob
              delete photo.base64
              console.log(photo)
              self.photoSaved(photo)
            }
            fileWriter.write(photo.blob)
          })
        })
      })
    },
    localStorageSaveFile (photo) {
      Vue.store.localStore.save({key: photo.name, data: photo.base64})
      photo.src = URL.createObjectURL(photo.blob)
      delete photo.blob
      delete photo.base64
      console.log(photo)
      this.photoSaved(photo)
    },
    photoSaved (photo) {
      this.photos.push(photo)
      this.$emit('newPhoto', photo)

      let self = this
      Vue.nextTick(function () {
        self.scrollToPhoto('photo_' + photo.id)
      })
    },
    imageReady (photo) {
      let now = this.$moment()
      photo.name = now.valueOf() + '.jpg'
      photo.taken_on = now.valueOf()
      photo.id = -now.valueOf()

      // save image to persistent file
      if (navigator && navigator.camera) {
        this.cordovaSaveFile(photo)
      }
      else {
        this.localStorageSaveFile(photo)
      }
    },
    scrollToPhoto (id) {
      console.debug('scroll start')
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
      console.debug('scroll end')
    }
  }
}
</script>

<style>
div.upper:first-letter {
  text-transform: uppercase;
}
</style>
