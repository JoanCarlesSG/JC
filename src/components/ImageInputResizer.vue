<template>
  <div style="display: none">
    <input
      type="file"
      ref="file"
      accept='image/*;capture=camera'
      @change="__add"
      />
  </div>
</template>

<script>
import { format } from 'quasar'
// destructuring to keep only what is needed
const { humanStorageSize } = format

// from https://github.com/nolanlawson/blob-util/blob/5f9598e158a00139b1cbdd89c03e425ac07e1dd6/lib/index.js
function binaryStringToArrayBuffer (binary) {
  var length = binary.length
  var buf = new ArrayBuffer(length)
  var arr = new Uint8Array(buf)
  var i = -1
  while (++i < length) {
    arr[i] = binary.charCodeAt(i)
  }
  return buf
}

function createBlob (parts, options) {
  options = options || {}
  if (typeof options === 'string') {
    options = {type: options}
  }
  return new Blob(parts, options)
}

function dataURLToBlob (dataURL) {
  return Promise.resolve().then(function () {
    var type = dataURL.match(/data:([^;]+)/)[1]
    var base64 = dataURL.replace(/^[^,]+,/, '')

    var buff = binaryStringToArrayBuffer(atob(base64))
    return createBlob([buff], {type: type})
  })
}

export default {
  name: 'image-input-resizer',
  props: {
    extensions: String,
    multiple: Boolean
  },
  data () {
    return {
      files: [],
      uploading: false,
      uploadedSize: 0,
      totalSize: 0,
      images: [],
      otherFiles: []
    }
  },
  methods: {
    __add (e) {
      // if (!this.multiple && this.files.length >= 1) {
      //   return
      // }
      let files = Array.prototype.slice.call(e.target.files)
      this.$emit('add', files)
      files = files
        .filter(file => !this.files.some(f => file.name === f.name))
        .map(file => {
          file.__failed = false
          file.__uploaded = 0
          file.__progress = 0
          file.__size = humanStorageSize(file.size)
          return file
        })
      files.filter(file => {
        return file.type.startsWith('image')
      }).forEach((file, index) => {
        var reader = new FileReader()
        reader.onload = (e) => {
          let img = new Image()
          img.src = e.target.result
          img.name = file.name
          img.__file = file

          let self = this
          img.onload = function () {
            var width = 0
            var height = 0
            if (img.width > img.height) {
              width = 1024
            }
            else {
              width = 768
            }
            height = Math.round(img.height * width / img.width)
            let canvas = self.imageToCanvas(img, width, height)
            // self.$emit('ready', canvas.toDataURL('image/jpeg'))
            let dataUrl = canvas.toDataURL('image/jpeg')
            dataURLToBlob(dataUrl).then(function (blob) {
              self.$emit('ready', blob)
            }).catch(function (err) {
              // error
              console.log(err)
            })
          }
        }
        reader.readAsDataURL(file)
      })
      this.otherFiles = this.otherFiles.concat(files.filter(file => !file.type.startsWith('image')))
      this.files = this.files.concat(files)
      this.$refs.file.value = ''
    },
    imageToCanvas (img, width, height) {
      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')
      canvas.setAttribute('width', width)
      canvas.setAttribute('height', height)
      ctx.drawImage(img, 0, 0, width, height)
      return canvas
    },
    newImage () {
      if (navigator && navigator.camera) {
        this.openCamera()
      }
      else {
        this.$refs.file.click()
      }
    },
    processImageFromCamera (uri) {
      // this.$emit('ready', 'data:image/jpeg;base64,' + uri)
      let dataUrl = 'data:image/jpeg;base64,' + uri
      let self = this
      dataURLToBlob(dataUrl).then(function (blob) {
        self.$emit('ready', blob)
      }).catch(function (err) {
        // error
        console.log(err)
      })
    },
    setOptions (srcType) {
      var options = {
        quality: 85,
        // destinationType: navigator.camera.DestinationType.FILE_URI,
        destinationType: navigator.camera.DestinationType.DATA_URL,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: navigator.camera.EncodingType.JPEG,
        mediaType: navigator.camera.MediaType.PICTURE,
        allowEdit: false,
        // Corrects Android orientation quirks
        correctOrientation: true,
        targetHeight: 1024,
        targetWidth: 768
      }
      return options
    },
    openCamera (selection) {
      var srcType = navigator.camera.PictureSourceType.CAMERA
      var options = this.setOptions(srcType)
      var func = this.processImageFromCamera

      navigator.camera.getPicture(function cameraSuccess (imageUri) {
        func(imageUri)
      }, function cameraError (error) {
        console.debug('Unable to obtain picture: ' + error, 'app')
      }, options)
    }
  }
}
</script>

<style>
</style>
