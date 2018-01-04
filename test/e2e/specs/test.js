// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  'default e2e tests': function (browser) {

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

    browser.expect.element('input[type=email]').to.have.value.equal(email)

    browser.pause(2000)
    browser
      .click('#login-button')
      .waitForElementVisible('.q-alert-content', 5000)
      .assert.containsText('.q-alert-content', 'Login error, please try again')

    browser.pause(100000)

    browser.end()
  }
}
