var
  config = require('../config'),
  theme = process.argv[2] || config.defaultTheme

module.exports = {
  dev: process.env.NODE_ENV === 'development',
  test: process.env.NODE_ENV === 'test',
  prod: process.env.NODE_ENV === 'production',

  platform: {
    theme: theme,
    cordovaAssets: './cordova/platforms/' + (theme === 'mat' ? 'android' : 'ios') + '/platform_www'
  }
}
