'use strict'

var bench = require('../../')

var run = bench([
  function aA (done) {
    setImmediate(done)
  },
  function aB (done) {
    process.nextTick(done)
  }
], 100)

run(run)
