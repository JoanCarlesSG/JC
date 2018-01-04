import Vue from 'vue'
import axios from 'axios'

var MockAdapter = require('axios-mock-adapter')

export default {
  activate: function () {
    console.log('Mocking remote API')

    // This sets the mock adapter on the default instance
    var mock = new MockAdapter(axios)
    // https://server3.microdisseny.com/ajgirona/feines_proveidors/o/token/

    // mock.onGet(Vue.API_ROOT + '/ajgirona/feines_proveidors/startup', {params: { '_version': '0.8.1', '_username': ''}}).reply(500)
    mock.onGet(Vue.API_ROOT + '/ajgirona/feines_proveidors/startup').reply(200, {
      users: [
        { id: 1, name: 'John Smith' }
      ]
    })

    // mock.onGet('https://server3.microdisseny.com/ajgirona/feines_proveidors/startup?_version=0.8.1&_username=').reply(500)
    // .reply(200, {
    //   users: [
    //     { id: 1, name: 'John Smith' }
    //   ]
    // });
    // mock.onPost('https://server3.microdisseny.com/ajgirona/feines_proveidors/startup?_version=0.8.1&_username=').reply(500)

    // mock.onAny(Vue.API_ROOT + '/ajgirona/feines_proveidors/').reply(500)
    // mock.onAny(Vue.API_ROOT + '/ajgirona/feines_proveidors/startup', {params: { '_version': '0.8.1', '_username': ''}}).reply(500)
  }
}
