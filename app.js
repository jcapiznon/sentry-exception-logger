'use strict'

const reekoh = require('reekoh')
const _plugin = new reekoh.plugins.ExceptionLogger()


let sentryClient = null

_plugin.on('exception', (error) => {
  sentryClient.captureException(error)

  _plugin.log(JSON.stringify({
    data: {message: error.message, stack: error.stack, name: error.name}
  }))
})

_plugin.once('ready', () => {
  let raven = require('raven')

  sentryClient = new raven.Client(_plugin.config.dsn)

  sentryClient.on('error', (error) => {
    console.error('Error on Sentry.', error)
    _plugin.logException(new Error(error.reason))
  })

  _plugin.log('Sentry Exception Logger has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
