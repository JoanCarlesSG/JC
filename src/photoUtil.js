import Vue from 'vue'

import blobUtil from 'blob-util'

export default {
  getBlob: function (photo, callback) {
    if (!photo.src) {
      console.error('Photo src not defined')
      console.error(photo)
      return
    }

    console.debug('getBlob', photo.src, photo)

    if (photo.src.startsWith('file:') ||
        photo.src.startsWith('blob:file:')) {
      this._getBlobCordova(photo, callback)
    }
    else if (photo.src.startsWith('blob:http')) {
      this._getBlobLocalStore(photo, callback)
    }
  },
  _getBlobLocalStore (photo, callback) {
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
  },
  _getBlobCordova (photo, callback) {
    console.log('Get Blob from Cordova')
    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, function (fs) {
      console.log(fs)
      fs.root.getFile(photo.name, { create: false, exclusive: false }, function (fileEntry) {
        console.log(fileEntry)

        fileEntry.file(function (file) {
          var reader = new FileReader()

          reader.onloadend = function () {
            console.log('Successful file read: ' + photo.src)

            let dataUrl = this.result
            blobUtil.dataURLToBlob(dataUrl).then(function (blob) {
              callback(blob)
            }).catch(function (err) {
              // error
              console.log(err)
            })
          }
          reader.readAsDataURL(file)
        })
      })
    })
  },
  deleteBlob: function (src, name) {
    if (src.startsWith('blob:')) {
      Vue.store.localStore.remove(name)
      console.log('localStorage used: ' + JSON.stringify(localStorage).length / 1024 + ' KB')
    }
    else {
      console.log('Delete Blob in Cordova, NOT implemented!')
    }
  }
}
