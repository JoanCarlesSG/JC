import Vue from 'vue'
import blobUtil from 'blob-util'

var test = {}

function newPhoto () {
  var canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768

  // below is optional
  var ctx = canvas.getContext('2d')
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'
  ctx.fillRect(100, 100, 200, 200)
  ctx.fillStyle = 'rgba(0, 255, 0, 0.2)'
  ctx.fillRect(150, 150, 200, 200)
  ctx.fillStyle = 'rgba(0, 0, 255, 0.2)'
  ctx.fillRect(200, 50, 200, 200)

  let dataUrl = canvas.toDataURL('image/jpeg')
  var p = blobUtil.dataURLToBlob(dataUrl).then(function (blob) {
    var photo = {}
    photo.blob = blob
    photo.base64 = dataUrl
    return photo
  }).catch(function (err) {
    // error
    console.log(err)
  })

  return p
}

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  test.test_add_photo = function () {
    console.log('TEST: Running test_add_photo')

    let job = {
      id: -1516297174485,
      // Proves Lot 8
      contract: 11,
      // Arbrat
      elementType: 1,
      // Av. de Ramon Folch
      location: 939,
      task: '8',
      note: '',
      quantity: '3',
      quantityReadonly: false,
      photos: [],
      status: 'open',
      created_on: '2018-01-18T17:39:34.485Z',
      updated_on: '2018-01-18T17:39:36.641Z'
    }

    window.store.state.jobs = []
    window.store.jobsAdd(job)

    newPhoto().then(photo => {
      Vue.router.replace('/form/' + job.id + '/')
      setTimeout(function () {
        window.app.$refs.view.selectedTab = 'tab-fotos'

        setTimeout(function () {
          window.store.state.currentForm.$refs.photos.imageReady(photo)
          console.log('CHEEEEEECK', window.store.state.jobs[-1516297174485].photos)
        })
      }, 1000)
    })
  }
}

export default test
