'use strict'

const amqp = require('amqplib')

let _app = null
let _channel = null
let _conn = null

describe('Sentry Exception Logger', function () {
  this.slow(5000)

  before('init', () => {
    process.env.PORT = 8081
    process.env.INPUT_PIPE = 'demo.pipe.exception-logger'
    process.env.BROKER = 'amqp://guest:guest@127.0.0.1/'
    process.env.CONFIG = '{"dsn": "https://1980fa4e225644be9573ce3a498fe491:cea7c796a0f648808f44a366a0f37f1b@sentry.io/142247"}'

    amqp.connect(process.env.BROKER)
      .then((conn) => {
        _conn = conn
        return conn.createChannel()
      }).then((channel) => {
        _channel = channel
      }).catch((err) => {
        console.log(err)
      })
  })

   after('terminate child process', function (done) {
    _conn.close()
    done()
  })

  describe('#start', function () {
    it('should start the app', function (done) {
      this.timeout(8000)
      _app = require('../app')
      _app.once('init', done)
    })
  })

  describe('#exception', function () {
    it('should log exception data', function (done) {
      this.timeout(15000)
      let dummyData = new Error('test')
      _channel.sendToQueue('demo.pipe.exception-logger', new Buffer(JSON.stringify({message: dummyData.message, stack: dummyData.stack, name:dummyData.name})))

      setTimeout(done, 5000)
    })
  })
})
