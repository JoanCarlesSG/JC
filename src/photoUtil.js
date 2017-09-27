import Vue from 'vue'

import blobUtil from 'blob-util'

export default {
  getBlob: function (photo, callback) {
    if (photo.src.startsWith('blob:')) {
      Vue.store.localStore.get(photo.name, function (base64) {
        if (base64.data) {
          blobUtil.dataURLToBlob(base64.data).then(function (blob) {
            callback(blob)
          }).catch(function (err) {
            // error
            console.log(err)
          })
        }
      })
    }
  }
}
