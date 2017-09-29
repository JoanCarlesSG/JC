import Vue from 'vue'

import blobUtil from 'blob-util'

export default {
  getBlob: function (photo, callback) {
    if (!photo.src) {
      console.error('Photo src not defined')
      console.error(photo)
      return
    }

    if (photo.src.startsWith('blob:')) {
      Vue.store.localStore.get(photo.name, function (base64) {
        if (base64 && base64.data) {
          blobUtil.dataURLToBlob(base64.data).then(function (blob) {
            callback(blob)
          }).catch(function (err) {
            // error
            console.log(err)
          })
        }
        else {
          console.error('Could not load image from localStorage: ' + photo.name)
        }
      })
    }
  },
  deleteBlob: function (src, name) {
    if (src.startsWith('blob:')) {
      Vue.store.localStore.remove(name)
      console.log('localStorage used: ' + JSON.stringify(localStorage).length / 1024 + ' KB')
    }
  }
}
