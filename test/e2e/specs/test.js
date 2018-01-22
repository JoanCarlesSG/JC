// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage
// http://nightwatchjs.org/api/

// var _ = require('lodash')

function navigateToApp (browser) {
  // automatically uses dev Server port from /config.index.js
  // default: http://localhost:8080
  // see nightwatch.conf.js
  const devServer = browser.globals.devServerURL
  browser.url(devServer)
}

function doFakeLogin (browser) {
  let state = {
    access_token: 'aczsGCgoTETcxEP8kvCz9RGslWf1Ug',
    username: 'manel.clos@ajgirona.cat',
    version: 60
  }

  sendState(browser, state)
  navigateToApp(browser)
}

function doLogin (browser) {
  const devServer = browser.globals.devServerURL
  const email = 'manel.clos@ajgirona.cat'

  browser
    .url(devServer)
    .waitForElementVisible('#q-app', 5000)
    .assert.elementPresent('.layout')
    .assert.containsText('.q-toolbar-subtitle', 'Ajuntament de Girona')
    .assert.elementCount('input', 2)
    .setValue('input[type=email]', email)
    .setValue('input[type=password]', 'goodpassword')
    .click('#login-button')
    .waitForElementVisible('.pull-to-refresh .q-list-header', 50000)
    .assert.containsText('.pull-to-refresh .q-list-header', 'Feines')
}

function sendState(browser, state) {
  browser
    .waitForElementVisible('#q-app', 5000)
    .execute(function(state) {
    window._.forOwn(state, function(value, key) {
      console.log('key', key, 'value', value)
      window.store.state[key] = value
    })
    window.store.stateSave()

    return window.CircularJSON.stringify(window.store.state)
  }, [state], function(result) {
    console.log('STATE: ', result)
  })
}

module.exports = {
  'add photo': function (browser) {
    navigateToApp(browser)
    doFakeLogin(browser)

    browser.execute(function(data) {
      window.test.test_add_photo()
      return 'ok'
    }, ['hello'], function(result) {
      console.log('RESULT: ', result)
    })

    browser.pause(1000000)
  },
  'login': function (browser) {
    navigateToApp(browser)
    doLogin(browser)

    browser.pause(10000)

    browser
      .click('#add-button')
      .waitForElementVisible('.q-tabs-head', 5000)

    browser
      .click('#element-type')
      .pause(500)
      .click('.q-popover .q-item:nth-child(1)')

    browser
      .click('#element-group')
      .pause(500)
      .click('.q-popover .q-item:nth-child(1)')

    browser
      .click('#element-task')
      .pause(500)
      .click('.q-popover .q-item:nth-child(1)')

    browser
      .setValue('#quantity input', 3)

    browser
      .setValue('#note textarea', 'test')

    browser
      .pause(500)
      .click('.q-toolbar-title')

    // browser.click('#close-button')
    browser.pause(1000)

    browser.execute(function(data) {
      return window.CircularJSON.stringify(window.store.state.jobs)
    }, ['hello'], function(result) {
      console.log('RESULT: ', result)
    })
    browser.pause(1000000)

    browser.end()
  },
  'bad login, then good login': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL
    const email = 'manel.clos@ajgirona.cat'

    browser
      .url(devServer)
      .waitForElementVisible('#q-app', 5000)
      .assert.elementPresent('.layout')
      .assert.containsText('.q-toolbar-subtitle', 'Ajuntament de Girona')
      .assert.elementCount('input', 2)
      .setValue('input[type=email]', email)
      .setValue('input[type=password]', 'badpassword')

    browser.expect.element('input[type=email]').to.have.value.equal(email)

    browser.pause(500)
    browser
      .click('#login-button')
      .waitForElementVisible('.q-alert-content', 5000)
      .assert.containsText('.q-alert-content', 'Login error, please try again')

    for (var i = 0; i < 11; i++) {
      browser
        .setValue('input[type=password]', browser.Keys.BACK_SPACE)
    }

    browser.pause(500)
    browser
      .setValue('input[type=password]', 'goodpassword')
      .click('#login-button')
      .waitForElementVisible('.pull-to-refresh .q-list-header', 50000)
      .assert.containsText('.pull-to-refresh .q-list-header', 'Feines')

    browser.end()
  }
}
