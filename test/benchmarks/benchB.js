'use strict'

var bench = require('../../')

var run = bench([
  function bA (done) {
    setImmediate(done)
  },
  function bB (done) {
    process.nextTick(done)
  }
], 100)

run(run)
