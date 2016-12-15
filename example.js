'use strict'

var bench = require('./')

var run = bench([
  function benchSetTimeout (done) {
    setTimeout(done, 0)
  },
  function benchSetImmediate (done) {
    setImmediate(done)
  },
  function confidence (done) {
    const l = Math.random() * 100
    for (var i = 0; i < l; i++) {}
    process.nextTick(done)
  },
  function benchNextTick (done) {
    process.nextTick(done)
  }
], 10000)

run(run)
