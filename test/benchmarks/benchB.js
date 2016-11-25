'use strict'

var bench = require('../../')

var run = bench([
  function a (done) {
    for (var i = 0; i < 20000000; i++) {}
    setImmediate(done)
  },
  function b (done) {
    for (var i = 0; i < 10000000; i++) {}
    process.nextTick(done)
  }
], 100)

run(run)
