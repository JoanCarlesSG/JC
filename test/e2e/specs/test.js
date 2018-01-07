// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage
// http://nightwatchjs.org/api/

function do_login(browser) {
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

module.exports = {
  'login': function (browser) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = browser.globals.devServerURL

    do_login(browser)

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

    browser.click('#close-button')
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
